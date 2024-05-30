import { AppDataSource } from '../data-source';
import { User } from '../entity/Publisher';
import { Spreadsheet } from '../entity/Spreadsheet';
import { Update } from '../entity/update';
import { MoreThan } from 'typeorm';

export class SpreadsheetService {
  static async registerUser({ firstName, lastName, email, password }) {
    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.password = password;
    await AppDataSource.manager.save(user);
    return { success: true, message: 'User registered' };
  }

  static async createSheet(publisherEmail: string) {
    const user = await AppDataSource.manager.findOneBy(User, { email: publisherEmail });
    if (!user) {
      throw new Error('Publisher not found');
    }
    const spreadsheet = new Spreadsheet();
    spreadsheet.primaryUserID = user.id;
    spreadsheet.sheetData = Array(10).fill('').map(() => Array(10).fill(''));
    await AppDataSource.manager.save(spreadsheet);
    return { success: true };
  }

  static async getSheets(publisherEmail: string) {
    const user = await AppDataSource.manager.findOneBy(User, { email: publisherEmail });
    if (!user) {
      throw new Error('Publisher not found');
    }
    const sheets = await AppDataSource.manager.find(Spreadsheet, { where: { primaryUserID: user.id } });
    const result = sheets.map(sheet => ({ publisher: user.email, sheetId: sheet.id }));
    return { success: true, value: result };
  }
}