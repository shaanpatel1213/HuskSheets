import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Spreadsheet } from '../entity/Spreadsheet';
import { Update } from '../entity/update';
import { Publisher } from '../entity/Publisher';
import { Cell } from '../entity/Cell';
import auth from '../services/auth';
import { User } from '../entity/User';

const router = Router();

const parseAndUpdateCells = async (spreadsheet: Spreadsheet, payload: string) => {
  const updates = payload.split('\n');
  for (const update of updates) {
    const [ref, term] = update.split(' ');
    if (!ref || !term) continue;

    const columnMatch = ref.match(/\$([A-Z]+)/);
    const rowMatch = ref.match(/\d+/);

    if (!columnMatch || !rowMatch) {
      continue;
    }

    const column = columnMatch[1].split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 'A'.charCodeAt(0) + 1), 0);
    const row = parseInt(rowMatch[0], 10);

    let cell = await AppDataSource.manager.findOneBy(Cell, { spreadsheet: spreadsheet, column: column, row: row }) || new Cell();
    cell.spreadsheet = spreadsheet;
    cell.column = column;
    cell.row = row;
    cell.content = term;

    await AppDataSource.manager.save(cell);
  }
};

router.use(auth);

router.get('/register', async (req, res) => {
  const { user_name, password } = req.user!;

  let publisher = await AppDataSource.manager.findOneBy(Publisher, { username: user_name });
  if (!publisher) {
    publisher = new Publisher();
    publisher.username = user_name;
    publisher.password = password;
    await AppDataSource.manager.save(publisher);
  }

  res.status(200).json({ success: true, message: user_name, value: [] });
});


router.get('/getPublishers', async (req, res) => {
  const publishers = await AppDataSource.manager.find(Publisher);
  const result = publishers.map(publisher => ({
    publisher: publisher.username,
    sheet: null,
    id: null,
    payload: null
  }));
  res.status(200).json({ success: true, message: null, value: result });
});

router.post('/getSheets', async (req, res) => {
  const { publisher } = req.body;
  const user = await AppDataSource.manager.findOneBy(Publisher, { username: publisher });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found', value: [] });
  }
  const sheets = await AppDataSource.manager.find(Spreadsheet, { where: { publisher: user } });
  const result = sheets.map(sheet => ({
    publisher: user.username,
    sheet: sheet.name,
    id: null,
    payload: null
  }));
  res.status(200).json({ success: true, message: null, value: result });
});

router.post('/createSheet', async (req, res) => {
  const { publisher, sheet } = req.body;
  const user = await AppDataSource.manager.findOneBy(Publisher, { username: publisher });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found', value: [] });
  }
  const spreadsheet = new Spreadsheet();
  spreadsheet.publisher = user;
  spreadsheet.name = sheet;
  await AppDataSource.manager.save(spreadsheet);
  res.status(200).json({ success: true, message: null, value: [] });
});

router.post('/deleteSheet', async (req, res) => {
  const { publisher, sheet } = req.body;
  const user = await AppDataSource.manager.findOne(Publisher, {
    where: { username: publisher }
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found', value: [] });
  }

  const spreadsheet = await AppDataSource.manager.findOne(Spreadsheet, {
    where: { name: sheet, publisher: user }
  });

  if (!spreadsheet) {
    return res.status(400).json({ success: false, message: 'Sheet not found', value: [] });
  }

  console.log("Deleting Spreadsheet: ", spreadsheet);

  // Delete cells associated with the spreadsheet
  await AppDataSource.manager.createQueryBuilder()
    .delete()
    .from(Cell)
    .where("spreadsheetId = :spreadsheetId", { spreadsheetId: spreadsheet.id })
    .execute();

  console.log("Cells deleted");

  // Delete updates associated with the spreadsheet
  await AppDataSource.manager.createQueryBuilder()
    .delete()
    .from(Update)
    .where("spreadsheetId = :spreadsheetId", { spreadsheetId: spreadsheet.id })
    .execute();

  console.log("Updates deleted");

  // Explicitly remove the spreadsheet
  await AppDataSource.manager.remove(spreadsheet);

  // Ensure spreadsheet is deleted
  const checkSpreadsheet = await AppDataSource.manager.findOne(Spreadsheet, {
    where: { id: spreadsheet.id }
  });

  console.log("Spreadsheet after removal", checkSpreadsheet);

  if (!checkSpreadsheet) {
    res.status(200).json({ success: true, message: null, value: [] });
  } else {
    res.status(500).json({ success: false, message: 'Failed to delete spreadsheet', value: [] });
  }
});

router.post('/getUpdatesForSubscription', async (req, res) => {
  const { publisher, sheet, id } = req.body;
  const user = await AppDataSource.manager.findOneBy(Publisher, { username: publisher });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found', value: [] });
  }

  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, { name: sheet, publisher: user });
  if (!spreadsheet) {
    return res.status(400).json({ success: false, message: 'Sheet not found', value: [] });
  }

  const updates = await AppDataSource.manager.createQueryBuilder(Update, 'update')
    .where('update.spreadsheet = :spreadsheet', { spreadsheet: spreadsheet.id })
    .andWhere('update.id > :id', { id })
    .getMany();

  const result = updates.map(update => ({
    publisher: user.username,
    sheet: spreadsheet.name,
    id: update.id.toString(),
    payload: update.payload
  }));

  res.status(200).json({ success: true, message: null, value: result.length > 0 ? result : [{ publisher, sheet, id, payload: "" }] });
});

router.post('/getUpdatesForPublished', async (req, res) => {
  const { publisher, sheet, id } = req.body;
  const user = await AppDataSource.manager.findOneBy(Publisher, { username: publisher });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found', value: [] });
  }
  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, { name: sheet, publisher: user });
  if (!spreadsheet) {
    return res.status(400).json({ success: false, message: 'Sheet not found', value: [] });
  }

  const updates = await AppDataSource.manager.createQueryBuilder(Update, 'update')
    .where('update.spreadsheet = :spreadsheet', { spreadsheet: spreadsheet.id })
    .andWhere('update.id > :id', { id })
    .getMany();

  const result = updates.map(update => ({
    publisher: user.username,
    sheet: spreadsheet.name,
    id: update.id.toString(),
    payload: update.payload
  }));

  res.status(200).json({ success: true, message: null, value: result.length > 0 ? result : [{ publisher, sheet, id, payload: "" }] });
});

router.post('/updatePublished', async (req, res) => {
  const { publisher, sheet, payload } = req.body;
  const user = await AppDataSource.manager.findOneBy(Publisher, { username: publisher });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found', value: [] });
  }
  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, { name: sheet, publisher: user });
  if (!spreadsheet) {
    return res.status(400).json({ success: false, message: 'Sheet not found', value: [] });
  }

  await parseAndUpdateCells(spreadsheet, payload);

  const updateRecord = new Update();
  updateRecord.spreadsheet = spreadsheet;
  updateRecord.payload = payload;
  await AppDataSource.manager.save(updateRecord);

  res.status(200).json({ success: true, message: null, value: [] });
});

router.post('/updateSubscription', async (req, res) => {
  const { publisher, sheet, payload } = req.body;
  const user = await AppDataSource.manager.findOneBy(Publisher, { username: publisher });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found', value: [] });
  }

  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, { name: sheet, publisher: user });
  if (!spreadsheet) {
    return res.status(400).json({ success: false, message: 'Sheet not found', value: [] });
  }

  await parseAndUpdateCells(spreadsheet, payload);

  const updateRecord = new Update();
  updateRecord.spreadsheet = spreadsheet;
  updateRecord.payload = payload;
  await AppDataSource.manager.save(updateRecord);

  res.status(200).json({ success: true, message: null, value: [] });
});

export default router;
