import { Request, Response, NextFunction } from 'express';
import { getPublishers } from '../../controllers/publisherController';
import * as publisherService from '../../services/publisherService';

// Mock the service
jest.mock('../../services/publisherService');

describe('publisherController', () => {
    describe('getPublishers', () => {
        it('should return all publishers', async () => {
            const req = {} as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const publishers = [
                { username: 'publisher1' },
                { username: 'publisher2' }
            ];
            (publisherService.getAllPublishers as jest.Mock).mockResolvedValue(publishers);

            await getPublishers(req, res, next);

            expect(publisherService.getAllPublishers).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: publishers });
        });

        it('should handle errors', async () => {
            const req = {} as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const error = new Error('Test error');
            (publisherService.getAllPublishers as jest.Mock).mockRejectedValue(error);

            await getPublishers(req, res, next);

            expect(publisherService.getAllPublishers).toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
