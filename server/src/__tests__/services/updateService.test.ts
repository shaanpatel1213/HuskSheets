import { AppDataSource } from '../../data-source';
import { Publisher } from '../../entity/Publisher';
import { Spreadsheet } from '../../entity/Spreadsheet';
import {
    getUpdatesForSubscription,
    getUpdatesForPublished,
    updatePublished,
    updateSubscription
} from '../../services/updateService';

jest.mock('../../data-source', () => ({
    AppDataSource: {
        manager: {
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getMany: jest.fn(),
            }),
            save: jest.fn()
        }
    }
}));

/**
 * Tests the update service methods
 * 
 * @author BrandonPetersen
 */
describe('updateService', () => {
    /**
     * Tests the getUpdatesForSubscription function to ensure it returns updates for a subscription.
     * @author BrandonPetersen
     */
    describe('getUpdatesForSubscription', () => {
        it('should return updates for subscription', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const id = '123';
            const user: Publisher = { id: 1, username: publisher, password: 'password', spreadsheets: [] };
            const spreadsheet: Spreadsheet = {
                idRef: 1,
                name: sheet,
                publisher: user,
                subscribers: [],
                cells: [],
                updates: []
            };
            const updates = [{ id: 124, payload: 'update1' }];

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(user);
            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(spreadsheet);
            (AppDataSource.manager.createQueryBuilder().getMany as jest.Mock).mockResolvedValue(updates);

            const result = await getUpdatesForSubscription(publisher, sheet, id);

            expect(AppDataSource.manager.findOneBy).toHaveBeenCalledWith(Publisher, { username: publisher });
            expect(AppDataSource.manager.findOneBy).toHaveBeenCalledWith(Spreadsheet, { name: sheet, publisher: user });
            expect(result).toEqual([
                { publisher: user.username, sheet: spreadsheet.name, id: updates[0].id.toString(), payload: updates[0].payload }
            ]);
        });

        it('should throw error if publisher not found', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const id = '123';

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(null);

            await expect(getUpdatesForSubscription(publisher, sheet, id)).rejects.toThrow('Publisher not found');
        });

        it('should throw error if sheet not found', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const id = '123';
            const user: Publisher = { id: 1, username: publisher, password: 'password', spreadsheets: [] };

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(user);
            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(null);

            await expect(getUpdatesForSubscription(publisher, sheet, id)).rejects.toThrow('Sheet not found');
        });
    });

    /**
     * Tests the getUpdatesForPublished function to ensure it returns updates for a published sheet.
     * @author BrandonPetersen
     */
    describe('getUpdatesForPublished', () => {
        it('should return updates for published sheet', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const id = '123';
            const user: Publisher = { id: 1, username: publisher, password: 'password', spreadsheets: [] };
            const spreadsheet: Spreadsheet = {
                idRef: 1,
                name: sheet,
                publisher: user,
                subscribers: [],
                cells: [],
                updates: []
            };
            const updates = [{ id: 124, payload: 'update1' }];

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(user);
            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(spreadsheet);
            (AppDataSource.manager.createQueryBuilder().getMany as jest.Mock).mockResolvedValue(updates);

            const result = await getUpdatesForPublished(publisher, sheet, id);

            expect(AppDataSource.manager.findOneBy).toHaveBeenCalledWith(Publisher, { username: publisher });
            expect(AppDataSource.manager.findOneBy).toHaveBeenCalledWith(Spreadsheet, { name: sheet, publisher: user });
            expect(result).toEqual([
                { publisher: user.username, sheet: spreadsheet.name, id: updates[0].id.toString(), payload: updates[0].payload }
            ]);
        });

        it('should throw error if publisher not found', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const id = '123';

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(null);

            await expect(getUpdatesForPublished(publisher, sheet, id)).rejects.toThrow('Publisher not found');
        });

        it('should throw error if sheet not found', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const id = '123';
            const user: Publisher = { id: 1, username: publisher, password: 'password', spreadsheets: [] };

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(user);
            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(null);

            await expect(getUpdatesForPublished(publisher, sheet, id)).rejects.toThrow('Sheet not found');
        });
    });

    /**
     * Tests the updatePublished function to ensure it updates a published sheet.
     * @author BrandonPetersen
     */
    describe('updatePublished', () => {
        it('should update published sheet', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const payload = 'A1 value\nB2 value2';
            const user: Publisher = { id: 1, username: publisher, password: 'password', spreadsheets: [] };
            const spreadsheet: Spreadsheet = {
                idRef: 1,
                name: sheet,
                publisher: user,
                subscribers: [],
                cells: [],
                updates: []
            };

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(user);
            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(spreadsheet);
            (AppDataSource.manager.save as jest.Mock).mockResolvedValue({});

            await updatePublished(publisher, sheet, payload);

            expect(AppDataSource.manager.findOneBy).toHaveBeenCalledWith(Publisher, { username: publisher });
            expect(AppDataSource.manager.findOneBy).toHaveBeenCalledWith(Spreadsheet, { name: sheet, publisher: user });
            expect(AppDataSource.manager.save).toHaveBeenCalled();
        });

        it('should throw error if publisher not found', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const payload = 'A1 value\nB2 value2';

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(null);

            await expect(updatePublished(publisher, sheet, payload)).rejects.toThrow('Publisher not found');
        });

        it('should throw error if sheet not found', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const payload = 'A1 value\nB2 value2';
            const user: Publisher = { id: 1, username: publisher, password: 'password', spreadsheets: [] };

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(user);
            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(null);

            await expect(updatePublished(publisher, sheet, payload)).rejects.toThrow('Sheet not found');
        });
    });

    /**
     * Tests the updateSubscription function to ensure it updates a subscription.
     * @author BrandonPetersen
     */
    describe('updateSubscription', () => {
        it('should update subscription', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const payload = 'A1 value\nB2 value2';
            const user: Publisher = { id: 1, username: publisher, password: 'password', spreadsheets: [] };
            const spreadsheet: Spreadsheet = {
                idRef: 1,
                name: sheet,
                publisher: user,
                subscribers: [],
                cells: [],
                updates: []
            };

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(user);
            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(spreadsheet);
            (AppDataSource.manager.save as jest.Mock).mockResolvedValue({});

            await updateSubscription(publisher, sheet, payload);

            expect(AppDataSource.manager.findOneBy).toHaveBeenCalledWith(Publisher, { username: publisher });
            expect(AppDataSource.manager.findOneBy).toHaveBeenCalledWith(Spreadsheet, { name: sheet, publisher: user });
            expect(AppDataSource.manager.save).toHaveBeenCalled();
        });

        it('should throw error if publisher not found', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const payload = 'A1 value\nB2 value2';

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(null);

            await expect(updateSubscription(publisher, sheet, payload)).rejects.toThrow('Publisher not found');
        });

        it('should throw error if sheet not found', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const payload = 'A1 value\nB2 value2';
            const user: Publisher = { id: 1, username: publisher, password: 'password', spreadsheets: [] };

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(user);
            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(null);

            await expect(updateSubscription(publisher, sheet, payload)).rejects.toThrow('Sheet not found');
        });
    });
});
