
import { AppDataSource } from "../data-source";
import { Publisher } from "../entity/Publisher";
import { Spreadsheet } from "../entity/Spreadsheet";
import { Cell } from "../entity/Cell";
import { Update } from "../entity/Update";
/**
 * This file contains services for managing sheets in the Husksheet application.
 * The services include operations for creating sheets, finding publishers and sheets,
 * deleting sheets, and retrieving sheets by publisher.
 *
 * @file sheetService.ts
 */



/**
 * Finds a publisher by their username.
 *
 * @param {string} username - The username of the publisher to find.
 * @returns {Promise<Publisher | null>} The found publisher.
 * 
 * @author syadav7173
 */
export const findPublisherByUsername = async (username: string) => {
  return await AppDataSource.manager.findOneBy(Publisher, { username });
};

/**
 * Retrieves all sheets associated with a given publisher.
 *
 * @param {Publisher} publisher - The publisher whose sheets are to be retrieved.
 * @returns {Promise<{ idRef: number, sheet: string }[]>} A list of sheet objects with idRef and sheet name.
 * 
 * @author syadav7173
 */
export const getSheetsByPublisher = async (publisher: Publisher) => {
  const sheets = await AppDataSource.manager.find(Spreadsheet, {
    where: { publisher },
  });
  return sheets.map(sheet => ({
    idRef: sheet.idRef,
    sheet: sheet.name,
  }));
};

/**
 * Creates a new sheet for a given publisher.
 *
 * @param {Publisher} publisher - The publisher for whom the sheet is to be created.
 * @param {string} sheetName - The name of the sheet to be created.
 * @returns {Promise<Spreadsheet>} The created spreadsheet object.
 * 
 * @author syadav7173
 */
export const createSheet = async (publisher: Publisher, sheetName: string) => {
  const spreadsheet = new Spreadsheet();
  spreadsheet.publisher = publisher;
  spreadsheet.name = sheetName;
  await AppDataSource.manager.save(spreadsheet);
  return spreadsheet;
};

/**
 * Finds a sheet by its name and publisher.
 *
 * @param {string} sheetName - The name of the sheet to find.
 * @param {Publisher} publisher - The publisher of the sheet.
 * @returns {Promise<Spreadsheet | null>} The found sheet or null if not found.
 * 
 * @author syadav7173
 */
export const findSheetByNameAndPublisher = async (sheetName: string, publisher: Publisher) => {
  return await AppDataSource.manager.findOne(Spreadsheet, {
    where: { name: sheetName, publisher },
  });
};

/**
 * Deletes a sheet along with its associated cells and updates.
 *
 * @param {Spreadsheet} spreadsheet - The spreadsheet to delete.
 * @returns {Promise<boolean>} True if the deletion was successful, false otherwise.
 * 
 * @author BrandonPetersen
 */
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
