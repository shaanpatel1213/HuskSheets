import { AppDataSource } from '../../data-source';
import { User } from '../../entity/User';
import { Buffer } from 'buffer';
import { seedUsers } from '../../middleware/seedUsers';

/** @author EmilyFink474 */
jest.mock('../../data-source', () => ({
    AppDataSource: {
        manager: {
            save: jest.fn()
        }
    }
}));

/** @author EmilyFink474 */
describe('seedUsers middleware', () => {
    test('tests the seed users were saved to the AppDataSource', async () => {
        await seedUsers();
        expect(AppDataSource.manager.save).toHaveBeenCalledTimes(3);
    });
});
