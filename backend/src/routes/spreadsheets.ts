import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Spreadsheet } from "../entity/Spreadsheet";
import { Update } from "../entity/update";
import { Publisher } from "../entity/Publisher";
import { Cell } from "../entity/Cell";
import auth from "../services/auth";

const router = Router();

const parseAndUpdateCells = async (
  spreadsheet: Spreadsheet,
  payload: string
) => {
  const updates = payload.split("\n");
  for (const update of updates) {
    const [ref, term] = update.split(" ");
    if (!ref || !term) continue;

    const columnMatch = ref.match(/\$([A-Z]+)/);
    const rowMatch = ref.match(/\d+/);

    if (!columnMatch || !rowMatch) {
      continue;
    }

    const column = columnMatch[1]
      .split("")
      .reduce(
        (acc, char) => acc * 26 + (char.charCodeAt(0) - "A".charCodeAt(0) + 1),
        0
      );
    const row = parseInt(rowMatch[0], 10);

    let cell =
      (await AppDataSource.manager.findOneBy(Cell, {
        spreadsheet: spreadsheet,
        column: column,
        row: row,
      })) || new Cell();
    cell.spreadsheet = spreadsheet;
    cell.column = column;
    cell.row = row;
    cell.content = term;

    await AppDataSource.manager.save(cell);
  }
};

// Middleware to authenticate all requests
router.use(auth);

/**
 * Registers a new publisher.
 * The username is taken from the authenticated user.
 * @route GET /register
 * @returns {Object} The result object with success, message, and value.
 *
 * Ownership: syadav7173
 */
router.get("/register", async (req, res) => {
  const { user_name, password } = req.user!;

  let publisher = await AppDataSource.manager.findOneBy(Publisher, {
    username: user_name,
  });
  if (!publisher) {
    publisher = new Publisher();
    publisher.username = user_name;
    publisher.password = password;
    await AppDataSource.manager.save(publisher);
  }

  res.status(200).json({ success: true, message: user_name, value: [] });
});

/**
 * Gets a list of all registered publishers.
 * @route GET /getPublishers
 * @returns {Object} The result object with success, message, and value.
 *
 * Ownership: syadav7173
 */
router.get("/getPublishers", async (req, res) => {
  const publishers = await AppDataSource.manager.find(Publisher);
  const result = publishers.map((publisher) => ({
    publisher: publisher.username,
    sheet: null,
    id: null,
    payload: null,
  }));
  res.status(200).json({ success: true, message: null, value: result });
});

/**
 * Gets a list of sheets for a specified publisher.
 * @route POST /getSheets
 * @param {Object} req.body - The request body containing the publisher.
 * @returns {Object} The result object with success, message, and value.
 *
 * Ownership: syadav7173
 */
router.post("/getSheets", async (req, res) => {
  const { publisher } = req.body;
  const user = await AppDataSource.manager.findOneBy(Publisher, {
    username: publisher,
  });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Publisher not found", value: [] });
  }
  const sheets = await AppDataSource.manager.find(Spreadsheet, {
    where: { publisher: user },
  });
  const result = sheets.map((sheet) => ({
    publisher: user.username,
    sheet: sheet.name,
    id: null,
    payload: null,
  }));
  res.status(200).json({ success: true, message: null, value: result });
});

/**
 * Creates a new sheet for the authenticated user.
 * @route POST /createSheet
 * @param {Object} req.body - The request body containing the publisher and sheet.
 * @returns {Object} The result object with success, message, and value.
 *
 * Ownership: syadav7173
 */
router.post("/createSheet", async (req, res) => {
  const { user_name } = req.user!;
  const { publisher, sheet } = req.body;
  if (publisher !== user_name) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Unauthorized: sender is not owner of sheet",
        value: [],
      });
  }
  const user = await AppDataSource.manager.findOneBy(Publisher, {
    username: publisher,
  });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Publisher not found", value: [] });
  }
  const spreadsheet = new Spreadsheet();
  spreadsheet.publisher = user;
  spreadsheet.name = sheet;
  await AppDataSource.manager.save(spreadsheet);
  res.status(200).json({ success: true, message: null, value: [] });
});

/**
 * Deletes a sheet for the authenticated user.
 * @route POST /deleteSheet
 * @param {Object} req.body - The request body containing the publisher and sheet.
 * @returns {Object} The result object with success, message, and value.
 *
 * Ownership: syadav7173
 */
router.post("/deleteSheet", async (req, res) => {
  const { publisher, sheet } = req.body;
  const user = await AppDataSource.manager.findOne(Publisher, {
    where: { username: publisher },
  });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Publisher not found", value: [] });
  }

  const spreadsheet = await AppDataSource.manager.findOne(Spreadsheet, {
    where: { name: sheet, publisher: user },
  });

  if (!spreadsheet) {
    return res
      .status(400)
      .json({ success: false, message: "Sheet not found", value: [] });
  }

  // Delete cells associated with the spreadsheet
  await AppDataSource.manager
    .createQueryBuilder()
    .delete()
    .from(Cell)
    .where("spreadsheetId = :spreadsheetId", { spreadsheetId: spreadsheet.id })
    .execute();

  // Delete updates associated with the spreadsheet
  await AppDataSource.manager
    .createQueryBuilder()
    .delete()
    .from(Update)
    .where("spreadsheetId = :spreadsheetId", { spreadsheetId: spreadsheet.id })
    .execute();

  // Explicitly remove the spreadsheet
  await AppDataSource.manager.remove(spreadsheet);

  // Ensure spreadsheet is deleted
  const checkSpreadsheet = await AppDataSource.manager.findOne(Spreadsheet, {
    where: { id: spreadsheet.id },
  });

  if (!checkSpreadsheet) {
    res.status(200).json({ success: true, message: null, value: [] });
  } else {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete spreadsheet",
        value: [],
      });
  }
});

/**
 * Gets updates for a subscription.
 * @route POST /getUpdatesForSubscription
 * @param {Object} req.body - The request body containing the publisher, sheet, and id.
 * @returns {Object} The result object with success, message, and value.
 *
 * Ownership: syadav7173
 */
router.post("/getUpdatesForSubscription", async (req, res) => {
  const { publisher, sheet, id } = req.body;
  const user = await AppDataSource.manager.findOneBy(Publisher, {
    username: publisher,
  });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Publisher not found", value: [] });
  }

  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, {
    name: sheet,
    publisher: user,
  });
  if (!spreadsheet) {
    return res
      .status(400)
      .json({ success: false, message: "Sheet not found", value: [] });
  }

  const updates = await AppDataSource.manager
    .createQueryBuilder(Update, "update")
    .where("update.spreadsheet = :spreadsheet", { spreadsheet: spreadsheet.id })
    .andWhere("update.id > :id", { id })
    .getMany();

  const result = updates.map((update) => ({
    publisher: user.username,
    sheet: spreadsheet.name,
    id: update.id.toString(),
    payload: update.payload,
  }));

  res
    .status(200)
    .json({
      success: true,
      message: null,
      value:
        result.length > 0 ? result : [{ publisher, sheet, id, payload: "" }],
    });
});

/**
 * Gets updates for published sheets for the authenticated user.
 * @route POST /getUpdatesForPublished
 * @param {Object} req.body - The request body containing the publisher, sheet, and id.
 * @returns {Object} The result object with success, message, and value.
 *
 * Ownership: syadav7173
 */
router.post("/getUpdatesForPublished", async (req, res) => {
  const { user_name } = req.user!;
  const { publisher, sheet, id } = req.body;
  if (publisher !== user_name) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Unauthorized: sender is not owner of sheet",
        value: [],
      });
  }
  const user = await AppDataSource.manager.findOneBy(Publisher, {
    username: publisher,
  });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Publisher not found", value: [] });
  }
  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, {
    name: sheet,
    publisher: user,
  });
  if (!spreadsheet) {
    return res
      .status(400)
      .json({ success: false, message: "Sheet not found", value: [] });
  }

  const updates = await AppDataSource.manager
    .createQueryBuilder(Update, "update")
    .where("update.spreadsheet = :spreadsheet", { spreadsheet: spreadsheet.id })
    .andWhere("update.id > :id", { id })
    .getMany();

  const result = updates.map((update) => ({
    publisher: user.username,
    sheet: spreadsheet.name,
    id: update.id.toString(),
    payload: update.payload,
  }));

  res
    .status(200)
    .json({
      success: true,
      message: null,
      value:
        result.length > 0 ? result : [{ publisher, sheet, id, payload: "" }],
    });
});

/**
 * Updates a published sheet for the authenticated user.
 * @route POST /updatePublished
 * @param {Object} req.body - The request body containing the publisher, sheet, and payload.
 * @returns {Object} The result object with success, message, and value.
 *
 * Ownership: syadav7173
 */
router.post("/updatePublished", async (req, res) => {
  const { user_name } = req.user!;
  const { publisher, sheet, payload } = req.body;
  if (publisher !== user_name) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Unauthorized: sender is not owner of sheet",
        value: [],
      });
  }
  const user = await AppDataSource.manager.findOneBy(Publisher, {
    username: publisher,
  });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Publisher not found", value: [] });
  }
  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, {
    name: sheet,
    publisher: user,
  });
  if (!spreadsheet) {
    return res
      .status(400)
      .json({ success: false, message: "Sheet not found", value: [] });
  }

  await parseAndUpdateCells(spreadsheet, payload);

  const updateRecord = new Update();
  updateRecord.spreadsheet = spreadsheet;
  updateRecord.payload = payload;
  await AppDataSource.manager.save(updateRecord);

  res.status(200).json({ success: true, message: null, value: [] });
});

/**
 * Updates a subscription.
 * @route POST /updateSubscription
 * @param {Object} req.body - The request body containing the publisher, sheet, and payload.
 * @returns {Object} The result object with success, message, and value.
 *
 * Ownership: syadav7173
 */
router.post("/updateSubscription", async (req, res) => {
  const { publisher, sheet, payload } = req.body;
  const user = await AppDataSource.manager.findOneBy(Publisher, {
    username: publisher,
  });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Publisher not found", value: [] });
  }

  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, {
    name: sheet,
    publisher: user,
  });
  if (!spreadsheet) {
    return res
      .status(400)
      .json({ success: false, message: "Sheet not found", value: [] });
  }

  await parseAndUpdateCells(spreadsheet, payload);

  const updateRecord = new Update();
  updateRecord.spreadsheet = spreadsheet;
  updateRecord.payload = payload;
  await AppDataSource.manager.save(updateRecord);

  res.status(200).json({ success: true, message: null, value: [] });
});

export default router;
