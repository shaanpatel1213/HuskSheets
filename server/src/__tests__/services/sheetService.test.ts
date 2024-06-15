import { AppDataSource } from '../../data-source';
import { Publisher } from '../../entity/Publisher';
import { Spreadsheet } from '../../entity/Spreadsheet';
import { findPublisherByUsername, getSheetsByPublisher, createSheet, findSheetByNameAndPublisher, deleteSheet } from '../../services/sheetService';

/**
 * @author Shaanpatel1213
 */
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
        },
        createQueryRunner: jest.fn().mockReturnValue({
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
            manager: {
                createQueryBuilder: jest.fn().mockReturnThis(),
                delete: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                execute: jest.fn(),
                remove: jest.fn()
            }
        })
    }
}));

describe('sheetService', () => {
    /**
     * Tests the findPublisherByUsername function to ensure it finds a publisher by username.
     * @author Shaanpatel1213
     */
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

    /**
     * Tests the getSheetsByPublisher function to ensure it returns sheets for a publisher.
     * @author Shaanpatel1213
     */
    describe('getSheetsByPublisher', () => {
        it('should return sheets for a publisher', async () => {
            const publisher = { username: 'testuser' };
            const sheets = [
                { idRef: 1, name: 'sheet1', publisher } as Spreadsheet,
                { idRef: 2, name: 'sheet2', publisher } as Spreadsheet
            ];
            (AppDataSource.manager.find as jest.Mock).mockResolvedValue(sheets);

            const result = await getSheetsByPublisher(publisher as Publisher);

            expect(AppDataSource.manager.find).toHaveBeenCalledWith(Spreadsheet, { where: { publisher } });
            expect(result).toEqual([
                { idRef: 1, sheet: 'sheet1' },
                { idRef: 2, sheet: 'sheet2' }
            ]);
        });
    });

    /**
     * Tests the createSheet function to ensure it creates a new sheet for the publisher.
     * @author Shaanpatel1213
     */
    describe('createSheet', () => {
        it('should create a new sheet for the publisher', async () => {
            const publisher = { username: 'testuser' } as Publisher;
            const sheetName = 'sheet1';
            const sheet = new Spreadsheet();
            sheet.idRef = 1;
            sheet.name = sheetName;
            sheet.publisher = publisher;

            (AppDataSource.manager.save as jest.Mock).mockResolvedValue(sheet);

            const result = await createSheet(publisher, sheetName);

            expect(AppDataSource.manager.save).toHaveBeenCalledWith(expect.objectContaining({
                name: sheetName,
                publisher
            }));

            expect(result).toEqual(expect.objectContaining({
                name: sheetName,
                publisher: expect.objectContaining({
                    username: 'testuser'
                })
            }));
        });
    });

    /**
     * Tests the deleteSheet function to ensure it deletes a sheet along with its associated cells and updates.
     * @author BrandonPetersen
     */
    describe('deleteSheet', () => {
        it('should delete a sheet and its related entities successfully', async () => {
            const spreadsheet = { idRef: 1, name: 'sheet1' } as Spreadsheet;
            const queryRunnerMock = AppDataSource.createQueryRunner();

            (queryRunnerMock.manager.createQueryBuilder().execute as jest.Mock).mockResolvedValue({});
            (queryRunnerMock.manager.remove as jest.Mock).mockResolvedValue({});
            await queryRunnerMock.connect();
            await queryRunnerMock.startTransaction();

            const result = await deleteSheet(spreadsheet);

            expect(queryRunnerMock.manager.createQueryBuilder().where).toHaveBeenCalledWith("spreadsheetIdRef = :idRef", { idRef: spreadsheet.idRef });
            expect(queryRunnerMock.manager.remove).toHaveBeenCalledWith(Spreadsheet, spreadsheet);
            expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
            expect(result).toBe(true);

            await queryRunnerMock.release();
        });

        it('should handle errors and rollback transaction if deletion fails', async () => {
            const spreadsheet = { idRef: 1, name: 'sheet1' } as Spreadsheet;
            const queryRunnerMock = AppDataSource.createQueryRunner();

            (queryRunnerMock.manager.createQueryBuilder().execute as jest.Mock).mockRejectedValue(new Error('Deletion error'));
            await queryRunnerMock.connect();
            await queryRunnerMock.startTransaction();

            const result = await deleteSheet(spreadsheet);

            expect(result).toBe(false);

            await queryRunnerMock.release();
        });
    });
});
