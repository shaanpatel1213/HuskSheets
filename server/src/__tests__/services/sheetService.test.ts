import { AppDataSource } from '../../data-source';
import { Publisher } from '../../entity/Publisher';
import { Spreadsheet } from '../../entity/Spreadsheet';
import { Cell } from '../../entity/Cell';
import { Update } from '../../entity/Update';
import { findPublisherByUsername, getSheetsByPublisher, createSheet, findSheetByNameAndPublisher, deleteSheet } from '../../services/sheetService';

// Mock the AppDataSource.manager methods
jest.mock('../../data-source', () => ({
    AppDataSource: {
        manager: {
            findOneBy: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
                delete: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                execute: jest.fn()
            }),
            remove: jest.fn()
        }
    }
}));

describe('sheetService', () => {
    describe('findPublisherByUsername', () => {
        it('should find a publisher by username', async () => {
            const username = 'testuser';
            const publisher = { username: 'testuser' };
            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValue(publisher);

            const result = await findPublisherByUsername(username);

            expect(AppDataSource.manager.findOneBy).toHaveBeenCalledWith(Publisher, { username });
            expect(result).toEqual(publisher);
        });

        it('should return null if publisher is not found', async () => {
            const username = 'testuser';
            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValue(null);

            const result = await findPublisherByUsername(username);

            expect(AppDataSource.manager.findOneBy).toHaveBeenCalledWith(Publisher, { username });
            expect(result).toBeNull();
        });
    });

    describe('getSheetsByPublisher', () => {
        it('should return sheets for a publisher', async () => {
            const publisher = { username: 'testuser' };
            const sheets = [{ name: 'sheet1' }, { name: 'sheet2' }];
            (AppDataSource.manager.find as jest.Mock).mockResolvedValue(sheets);

            const result = await getSheetsByPublisher(publisher as Publisher);

            expect(AppDataSource.manager.find).toHaveBeenCalledWith(Spreadsheet, { where: { publisher } });
            expect(result).toEqual(sheets);
        });
    });

    describe('createSheet', () => {
        it('should create a new sheet for the publisher', async () => {
            const publisher = { username: 'testuser' } as Publisher;
            const sheetName = 'sheet1';
            const sheet = { name: sheetName, publisher };
            (AppDataSource.manager.save as jest.Mock).mockResolvedValue(sheet);

            const result = await createSheet(publisher, sheetName);

            expect(AppDataSource.manager.save).toHaveBeenCalledWith(expect.objectContaining({
                name: sheetName,
                publisher
            }));
            expect(result).toEqual(sheet);
        });
    });
});
