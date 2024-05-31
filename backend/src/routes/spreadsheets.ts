import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Spreadsheet } from '../entity/Spreadsheet';
import { Update } from '../entity/update';
import { Publisher } from '../entity/Publisher';
import { Cell } from '../entity/Cell';
import { MoreThan } from 'typeorm';
import { STATUS_CODES } from 'http';

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

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const publisher = new Publisher();
  publisher.username = username;
  publisher.password = password;

  await AppDataSource.manager.save(publisher);
  res.status(200).json({ success: true, message: 'Publisher registered' });
});

router.get('/getPublishers', async (req, res) => {
  const publishers = await AppDataSource.manager.find(Publisher);
  const result = publishers.map(publisher => ({ publisher: publisher.username }));
  res.status(200).json({ success: true, value: result });
});

router.post('/createSheet', async (req, res) => {
  const { publisher, name } = req.body;
  const user = await AppDataSource.manager.findOneBy(Publisher, { username: publisher });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found' });
  }
  const spreadsheet = new Spreadsheet();
  spreadsheet.publisher = user;
  spreadsheet.name = name;
  spreadsheet.cells = [];
  await AppDataSource.manager.save(spreadsheet);
  res.status(200).json({ success: true });
});

router.get('/getSheets', async (req, res) => {
  const { publisher } = req.query;
  const user = await AppDataSource.manager.findOneBy(Publisher, { username: publisher as string });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found' });
  }
  const sheets = await AppDataSource.manager.find(Spreadsheet, { where: { publisher: user } });
  const result = sheets.map(sheet => ({ publisher: user.username, sheetName: sheet.name }));
  res.status(200).json({ success: true, value: result });
});

router.delete('/deleteSheet', async (req, res) => {
  const { publisher, sheetName } = req.body;
  const user = await AppDataSource.manager.findOne(Publisher, {
    where: { username: publisher },
    relations: ['spreadsheets']
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found' });
  }

  const spreadsheet = await AppDataSource.manager.findOne(Spreadsheet, {
    where: { name: sheetName, publisher: user },
    relations: ['cells', 'updates']
  });

  if (!spreadsheet) {
    return res.status(400).json({ success: false, message: 'Sheet not found' });
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
    res.status(200).json({ success: true });
  } else {
    res.status(500).json({ success: false, message: 'Failed to delete spreadsheet' });
  }
});




router.get('/getUpdatesForSubscription', async (req, res) => {
  const { publisher, sheetName, id } = req.query;
  const user = await AppDataSource.manager.findOneBy(Publisher, { username: publisher as string });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found' });
  }

  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, { name: sheetName as string, publisher: user });
  if (!spreadsheet) {
    return res.status(400).json({ success: false, message: 'Sheet not found' });
  }
  
  const updates = await AppDataSource.manager.createQueryBuilder(Update, 'Update')
  .innerJoinAndSelect('Update.spreadsheet', 'spreadsheet')
  .where('spreadsheet.name = :name', { name: sheetName })  // Assuming `sheetId` is the sheet name
  .andWhere('spreadsheet.publisher = :publisherId', { publisherId: user.id })
  .andWhere('update.id > :id', { id })
  .getMany();


  const result = updates.map(update => update.payload);
  res.status(200).json({ success: true, value: result });
});

router.get('/getUpdatesForPublished', async (req, res) => {
  const { publisher, sheetName, id } = req.query;
  const user = await AppDataSource.manager.findOneBy(Publisher, { username: publisher as string });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found' });
  }
  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, { name: sheetName as string, publisher: user });
  if (!spreadsheet) {
    return res.status(400).json({ success: false, message: 'Sheet not found' });
  }

  const updates = await AppDataSource.manager.createQueryBuilder(Update, 'Update')
  .innerJoinAndSelect('Update.spreadsheet', 'spreadsheet')
  .where('spreadsheet.name = :name', { name: sheetName })  // Assuming `sheetId` is the sheet name
  .andWhere('spreadsheet.publisher = :publisherId', { publisherId: user.id })
  .andWhere('update.id > :id', { id })
  .getMany();


  const result = updates.map(update => update.payload);
  res.status(200).json({ success: true, value: result });
});

router.post('/updatePublished', async (req, res) => {
  const { publisher, sheetName, payload } = req.body;
  const user = await AppDataSource.manager.findOneBy(Publisher, { username: publisher });
  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found' });
  }
  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, { name: sheetName, publisher: user });
  if (!spreadsheet) {
    return res.status(400).json({ success: false, message: 'Sheet not found' });
  }

  await parseAndUpdateCells(spreadsheet, payload);

  const updateRecord = new Update();
  updateRecord.spreadsheet = spreadsheet;
  updateRecord.payload = payload;
  await AppDataSource.manager.save(updateRecord);

  res.status(200).json({ success: true});
});

router.post('/updateSubscription', async (req, res) => {
  const { publisher, sheetName, payload } = req.body;
  const user = await AppDataSource.manager.findOneBy(Publisher, { username: publisher });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Publisher not found' });
  }

  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, { name: sheetName, publisher: user });
  if (!spreadsheet) {
    return res.status(400).json({ success: false, message: 'Sheet not found' });
  }

  await parseAndUpdateCells(spreadsheet, payload);

  const updateRecord = new Update();
  updateRecord.spreadsheet = spreadsheet;
  updateRecord.payload = payload;
  await AppDataSource.manager.save(updateRecord);

  res.status(200).json({ success: true});
});

export default router;
