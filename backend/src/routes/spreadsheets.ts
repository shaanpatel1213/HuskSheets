import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Spreadsheet } from '../entity/Spreadsheet';
import { Update } from '../entity/update';
import { User } from '../entity/User';
import { MoreThan } from 'typeorm';

const router = Router();

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  console.log("Received body:", req.body);

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const user = new User();
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.password = password;
  
  await AppDataSource.manager.save(user);
  res.json({ success: true, message: 'User registered' });
});

router.get('/getPublishers', async (req, res) => {
  const users = await AppDataSource.manager.find(User);
  const publishers = users.map(user => ({ publisher: user.email }));
  res.json({ success: true, value: publishers });
});

router.post('/createSheet', async (req, res) => {
  const { publisher } = req.body;
  const user = await AppDataSource.manager.findOneBy(User, { email: publisher });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found' });
  }
  const spreadsheet = new Spreadsheet();
  spreadsheet.primaryUserID = user.id;
  spreadsheet.sheetData = Array(10).fill('').map(() => Array(10).fill(''));
  await AppDataSource.manager.save(spreadsheet);
  res.json({ success: true });
});

router.get('/getSheets', async (req, res) => {
  const { publisher } = req.query;
  const user = await AppDataSource.manager.findOneBy(User, { email: publisher as string });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found' });
  }
  const sheets = await AppDataSource.manager.find(Spreadsheet, { where: { primaryUserID: user.id } });
  const result = sheets.map(sheet => ({ publisher: user.email, sheetId: sheet.id }));
  res.json({ success: true, value: result });
});

router.delete('/deleteSheet', async (req, res) => {
  const { publisher, sheetId } = req.body;
  const user = await AppDataSource.manager.findOneBy(User, { email: publisher });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found' });
  }
  const result = await AppDataSource.manager.delete(Spreadsheet, { id: Number(sheetId), primaryUserID: user.id });
  if (result.affected) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Sheet not found' });
  }
});

router.get('/getUpdatesForSubscription', async (req, res) => {
  const { publisher, sheetId, id } = req.query;
  const user = await AppDataSource.manager.findOneBy(User, { email: publisher as string });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found' });
  }

  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, { id: Number(sheetId), primaryUserID: user.id });
  if (!spreadsheet) {
    return res.status(400).json({ success: false, message: 'Sheet not found' });
  }
  const updates = await AppDataSource.manager.find(Update, { where: { sheet: { id: spreadsheet.id }, id: MoreThan(Number(id)) } });
  const result = updates.map(update => update.payload);
  res.json({ success: true, value: result });
});

router.get('/getUpdatesForPublished', async (req, res) => {
  const { publisher, sheetId, id } = req.query;
  const user = await AppDataSource.manager.findOneBy(User, { email: publisher as string });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found' });
  }
  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, { id: Number(sheetId), primaryUserID: user.id });
  if (!spreadsheet) {
    return res.status(400).json({ success: false, message: 'Sheet not found' });
  }

  const updates = await AppDataSource.manager.find(Update, { where: { sheet: { id: spreadsheet.id }, id: MoreThan(Number(id)) } });
  const result = updates.map(update => update.payload);
  res.json({ success: true, value: result });
});

router.post('/updatePublished', async (req, res) => {
  const { publisher, sheetId, payload } = req.body;
  const user = await AppDataSource.manager.findOneBy(User, { email: publisher });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found' });
  }
  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, { id: Number(sheetId), primaryUserID: user.id });
  if (!spreadsheet) {
    return res.status(400).json({ success: false, message: 'Sheet not found' });
  }
  const update = new Update();
  update.sheet = spreadsheet;
  update.payload = payload;
  await AppDataSource.manager.save(update);
  res.json({ success: true });
});

router.post('/updateSubscription', async (req, res) => {
  const { publisher, sheetId, payload } = req.body;
  const user = await AppDataSource.manager.findOneBy(User, { email: publisher });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found' });
  }

  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, { id: Number(sheetId), primaryUserID: user.id });
  if (!spreadsheet) {
    return res.status(400).json({ success: false, message: 'Sheet not found' });
  }
  const update = new Update();
  update.sheet = spreadsheet;
  update.payload = payload;
  await AppDataSource.manager.save(update);
  res.json({ success: true });
});

export default router;
