import { AppDataSource } from "../data-source";
import { Publisher } from "../entity/Publisher";
import { Spreadsheet } from "../entity/Spreadsheet";
import { Update } from "../entity/Update";
import { Cell } from "../entity/Cell";

/**
 * Parses and updates cells in a given spreadsheet with the provided payload.
 * @param {Spreadsheet} spreadsheet - The spreadsheet to update.
 * @param {string} payload - The payload containing cell updates.
 * @returns {Promise<void>}
 *
 * Ownership: @author BrandonPetersen
 */
const parseAndUpdateCells = async (spreadsheet: Spreadsheet, payload: string) => {
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

/**
 * Retrieves updates for a subscription to a spreadsheet.
 * @param {string} publisher - The publisher's username.
 * @param {string} sheet - The name of the sheet.
 * @param {string} id - The last known update ID.
 * @returns {Promise<Object[]>} - The list of updates.
 *
 * Ownership: @author BrandonPetersen
 */
export const getUpdatesForSubscription = async (publisher: string, sheet: string, id: string) => {
  const user = await AppDataSource.manager.findOneBy(Publisher, {
    username: publisher,
  });
  if (!user) {
    throw new Error("Publisher not found");
  }

  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, {
    name: sheet,
    publisher: user,
  });
  if (!spreadsheet) {
    throw new Error("Sheet not found");
  }

  const updates = await AppDataSource.manager
    .createQueryBuilder(Update, "update")
    .where("update.spreadsheet = :spreadsheet", { spreadsheet: spreadsheet.id })
    .andWhere("update.id > :id", { id })
    .getMany();

  return updates.map((update) => ({
    publisher: user.username,
    sheet: spreadsheet.name,
    id: update.id.toString(),
    payload: update.payload,
  }));
};

/**
 * Retrieves updates for a published spreadsheet.
 * @param {string} publisher - The publisher's username.
 * @param {string} sheet - The name of the sheet.
 * @param {string} id - The last known update ID.
 * @returns {Promise<Object[]>} - The list of updates.
 *
 * Ownership: @author BrandonPetersen
 */
export const getUpdatesForPublished = async (publisher: string, sheet: string, id: string) => {
  const user = await AppDataSource.manager.findOneBy(Publisher, {
    username: publisher,
  });
  if (!user) {
    throw new Error("Publisher not found");
  }

  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, {
    name: sheet,
    publisher: user,
  });
  if (!spreadsheet) {
    throw new Error("Sheet not found");
  }

  const updates = await AppDataSource.manager
    .createQueryBuilder(Update, "update")
    .where("update.spreadsheet = :spreadsheet", { spreadsheet: spreadsheet.id })
    .andWhere("update.id > :id", { id })
    .getMany();

  return updates.map((update) => ({
    publisher: user.username,
    sheet: spreadsheet.name,
    id: update.id.toString(),
    payload: update.payload,
  }));
};

/**
 * Updates a published spreadsheet with new cell data.
 * @param {string} publisher - The publisher's username.
 * @param {string} sheet - The name of the sheet.
 * @param {string} payload - The payload containing cell updates.
 * @returns {Promise<void>}
 *
 * Ownership: @author BrandonPetersen
 */
export const updatePublished = async (publisher: string, sheet: string, payload: string) => {
  const user = await AppDataSource.manager.findOneBy(Publisher, {
    username: publisher,
  });
  if (!user) {
    throw new Error("Publisher not found");
  }

  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, {
    name: sheet,
    publisher: user,
  });
  if (!spreadsheet) {
    throw new Error("Sheet not found");
  }

  await parseAndUpdateCells(spreadsheet, payload);

  const updateRecord = new Update();
  updateRecord.spreadsheet = spreadsheet;
  updateRecord.payload = payload;
  await AppDataSource.manager.save(updateRecord);
};

/**
 * Updates a subscription to a spreadsheet with new cell data.
 * @param {string} publisher - The publisher's username.
 * @param {string} sheet - The name of the sheet.
 * @param {string} payload - The payload containing cell updates.
 * @returns {Promise<void>}
 *
 * Ownership: @author BrandonPetersen
 */
export const updateSubscription = async (publisher: string, sheet: string, payload: string) => {
  const user = await AppDataSource.manager.findOneBy(Publisher, {
    username: publisher,
  });

  if (!user) {
    throw new Error("Publisher not found");
  }

  const spreadsheet = await AppDataSource.manager.findOneBy(Spreadsheet, {
    name: sheet,
    publisher: user,
  });
  if (!spreadsheet) {
    throw new Error("Sheet not found");
  }

  await parseAndUpdateCells(spreadsheet, payload);

  const updateRecord = new Update();
  updateRecord.spreadsheet = spreadsheet;
  updateRecord.payload = payload;
  await AppDataSource.manager.save(updateRecord);
};
