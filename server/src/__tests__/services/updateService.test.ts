import { AppDataSource } from '../../data-source';
import { Publisher } from '../../entity/Publisher';
import { Spreadsheet } from '../../entity/Spreadsheet';
import {
    getUpdatesForSubscription,
    getUpdatesForPublished,
    updatePublished,
    updateSubscription
} from '../../services/updateService';

// Ownership : Shaanpatel1213
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

describe('updateService', () => {
    describe('getUpdatesForSubscription', () => {
        it('should return updates for subscription', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const id = '123';
            const user = { username: publisher } as Publisher;
            const spreadsheet = { id: 1, name: sheet, publisher: user } as Spreadsheet;
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
            const user = { username: publisher } as Publisher;

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(user);
            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(null);

            await expect(getUpdatesForSubscription(publisher, sheet, id)).rejects.toThrow('Sheet not found');
        });
    });

    describe('getUpdatesForPublished', () => {
        it('should return updates for published sheet', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const id = '123';
            const user = { username: publisher } as Publisher;
            const spreadsheet = { id: 1, name: sheet, publisher: user } as Spreadsheet;
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
            const user = { username: publisher } as Publisher;

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(user);
            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(null);

            await expect(getUpdatesForPublished(publisher, sheet, id)).rejects.toThrow('Sheet not found');
        });
    });

    describe('updatePublished', () => {
        it('should update published sheet', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const payload = 'A1 value\nB2 value2';
            const user = { username: publisher } as Publisher;
            const spreadsheet = { id: 1, name: sheet, publisher: user } as Spreadsheet;

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
            const user = { username: publisher } as Publisher;

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(user);
            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(null);

            await expect(updatePublished(publisher, sheet, payload)).rejects.toThrow('Sheet not found');
        });
    });

    describe('updateSubscription', () => {
        it('should update subscription', async () => {
            const publisher = 'testuser';
            const sheet = 'sheet1';
            const payload = 'A1 value\nB2 value2';
            const user = { username: publisher } as Publisher;
            const spreadsheet = { id: 1, name: sheet, publisher: user } as Spreadsheet;

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
            const user = { username: publisher } as Publisher;

            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(user);
            (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(null);

            await expect(updateSubscription(publisher, sheet, payload)).rejects.toThrow('Sheet not found');
        });
    });
});
