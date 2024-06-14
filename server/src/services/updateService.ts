import { AppDataSource } from "../data-source";
import { Publisher } from "../entity/Publisher";
import { Spreadsheet } from "../entity/Spreadsheet";
import { Update } from "../entity/Update";
import { Cell } from "../entity/Cell";
import { parseAndUpdateCells } from "./cellService";

/**
 * This file contains services for managing updates within the Husksheet application.
 * The services include operations for getting updates for subscriptions and published sheets,
 * as well as updating published and subscription sheets.
 *
 */

/**
 * Returns the updates for the given published sheet occurring after the given id.
 *
 * @param {string} publisher - The name of the publisher.
 * @param {string} sheet - The name of the sheet.
 * @param {string} id - The ID to get updates for.
 * @returns {Promise<Array>} A promise that resolves to an array of updates.
 * @throws {Error} If the publisher or sheet is not found.
 * 
 * @author syadav7173
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
    .where("update.spreadsheet = :spreadsheet", { spreadsheet: spreadsheet.idRef })
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
 * Returns the updates for the given published sheet occurring after the given id.
 *
 * @param {string} publisher - The name of the publisher.
 * @param {string} sheet - The name of the sheet.
 * @param {string} id - The ID to get updates for.
 * @returns {Promise<Array>} A promise that resolves to an array of updates.
 * @throws {Error} If the publisher or sheet is not found.
 * 
 * @author BrandonPetersen
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
    .where("update.spreadsheet = :spreadsheet", { spreadsheet: spreadsheet.idRef }) 
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
 * Updates the published sheet with the given payload.
 *
 * @param {string} publisher - The name of the publisher.
 * @param {string} sheet - The name of the sheet.
 * @param {string} payload - The update payload.
 * @throws {Error} If the publisher or sheet is not found.
 * 
 * @author BrandonPetersen
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
 * Updates the subscription sheet with the given payload.
 *
 * @param {string} publisher - The name of the publisher.
 * @param {string} sheet - The name of the sheet.
 * @param {string} payload - The update payload.
 * @throws {Error} If the publisher or sheet is not found.
 * 
 * @author BrandonPetersen
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
