import { AppDataSource } from '../../data-source';
import { Publisher } from '../../entity/Publisher';
import { findPublisherByUsername, createPublisher, getAllPublishers } from '../../services/publisherService';

// Ownership : Shaanpatel1213
jest.mock('../../data-source', () => ({
    AppDataSource: {
        manager: {
            findOneBy: jest.fn(),
            save: jest.fn(),
            find: jest.fn()
        }
    }
}));

describe('publisherService', () => {
    describe('findPublisherByUsername', () => {
        it('should find a publisher by username', async () => {
            const username = 'testuser';
            const publisher = { username: 'testuser', password: 'password123' };
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

    describe('createPublisher', () => {
        it('should create a new publisher', async () => {
            const username = 'testuser';
            const password = 'password123';
            const publisher = { username, password };
            (AppDataSource.manager.save as jest.Mock).mockResolvedValue(publisher);

            const result = await createPublisher(username, password);

            expect(AppDataSource.manager.save).toHaveBeenCalledWith(expect.objectContaining({
                username,
                password
            }));
            expect(result).toEqual(publisher);
        });
    });

    describe('getAllPublishers', () => {
        it('should return all publishers', async () => {
            const publishers = [
                { username: 'publisher1', password: 'password1' },
                { username: 'publisher2', password: 'password2' }
            ];
            (AppDataSource.manager.find as jest.Mock).mockResolvedValue(publishers);

            const result = await getAllPublishers();

            expect(AppDataSource.manager.find).toHaveBeenCalledWith(Publisher);
            expect(result).toEqual(publishers);
        });
    });
});
