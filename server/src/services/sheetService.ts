import { AppDataSource } from "../data-source";
import { Publisher } from "../entity/Publisher";
import { Spreadsheet } from "../entity/Spreadsheet";
import { Cell } from "../entity/Cell";
import { Update } from "../entity/Update";

export const findPublisherByUsername = async (username: string) => {
  return await AppDataSource.manager.findOneBy(Publisher, { username });
};

export const getSheetsByPublisher = async (publisher: Publisher) => {
  const sheets = await AppDataSource.manager.find(Spreadsheet, {
    where: { publisher },
  });
  return sheets.map(sheet => ({
    id: sheet.id,
    sheet: sheet.name,
  }));
};
export const createSheet = async (publisher: Publisher, sheetName: string) => {
  const spreadsheet = new Spreadsheet();
  spreadsheet.publisher = publisher;
  spreadsheet.name = sheetName;
  await AppDataSource.manager.save(spreadsheet);
  return spreadsheet;
};

export const findSheetByNameAndPublisher = async (sheetName: string, publisher: Publisher) => {
  return await AppDataSource.manager.findOne(Spreadsheet, {
    where: { name: sheetName, publisher },
  });
};

export const deleteSheet = async (spreadsheet: Spreadsheet) => {
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

  return !checkSpreadsheet;
};
