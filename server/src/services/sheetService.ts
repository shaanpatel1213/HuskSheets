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
    idRef: sheet.idRef,
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
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Correctly reference the foreign key column names
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from(Cell)
      .where("spreadsheetIdRef = :idRef", { idRef: spreadsheet.idRef })
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from(Update)
      .where("spreadsheetIdRef = :idRef", { idRef: spreadsheet.idRef })
      .execute();

    await queryRunner.manager.remove(Spreadsheet, spreadsheet);

    await queryRunner.commitTransaction();
    return true;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error deleting spreadsheet:", error);
    return false;
  } finally {
    await queryRunner.release();
  }
};
