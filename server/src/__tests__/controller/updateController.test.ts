import { Request, Response, NextFunction } from 'express';
import { getUpdatesForSubscription, getUpdatesForPublished, updatePublished, updateSubscription } from '../../controllers/updateController';
import * as updateService from '../../services/updateService';

// Mock the services
jest.mock('../../services/updateService');

describe('updateController', () => {
    describe('getUpdatesForSubscription', () => {
        it('should return updates for subscription', async () => {
            const req = { body: { publisher: 'testuser', sheet: 'sheet1', id: '123' } } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const updates = [{ update: 'update1' }];
            (updateService.getUpdatesForSubscription as jest.Mock).mockResolvedValue(updates);

            await getUpdatesForSubscription(req, res, next);

            expect(updateService.getUpdatesForSubscription).toHaveBeenCalledWith('testuser', 'sheet1', '123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: updates });
        });

        it('should handle errors', async () => {
            const req = { body: { publisher: 'testuser', sheet: 'sheet1', id: '123' } } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const error = new Error('Test error');
            (updateService.getUpdatesForSubscription as jest.Mock).mockRejectedValue(error);

            await getUpdatesForSubscription(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getUpdatesForPublished', () => {
        it('should return 401 if publisher is not the user', async () => {
            const req = {
                user: { user_name: 'testuser' },
                body: { publisher: 'otheruser', sheet: 'sheet1', id: '123' }
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            await getUpdatesForPublished(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Unauthorized: sender is not owner of sheet',
                value: []
            });
        });

        it('should return updates for published sheet', async () => {
            const req = {
                user: { user_name: 'testuser' },
                body: { publisher: 'testuser', sheet: 'sheet1', id: '123' }
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const updates = [{ update: 'update1' }];
            (updateService.getUpdatesForPublished as jest.Mock).mockResolvedValue(updates);

            await getUpdatesForPublished(req, res, next);

            expect(updateService.getUpdatesForPublished).toHaveBeenCalledWith('testuser', 'sheet1', '123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: updates });
        });

        it('should handle errors', async () => {
            const req = {
                user: { user_name: 'testuser' },
                body: { publisher: 'testuser', sheet: 'sheet1', id: '123' }
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const error = new Error('Test error');
            (updateService.getUpdatesForPublished as jest.Mock).mockRejectedValue(error);

            await getUpdatesForPublished(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updatePublished', () => {
        it('should return 401 if publisher is not the user', async () => {
            const req = {
                user: { user_name: 'testuser' },
                body: { publisher: 'otheruser', sheet: 'sheet1', payload: {} }
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            await updatePublished(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Unauthorized: sender is not owner of sheet',
                value: []
            });
        });

        it('should update published sheet', async () => {
            const req = {
                user: { user_name: 'testuser' },
                body: { publisher: 'testuser', sheet: 'sheet1', payload: {} }
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            (updateService.updatePublished as jest.Mock).mockResolvedValue(true);

            await updatePublished(req, res, next);

            expect(updateService.updatePublished).toHaveBeenCalledWith('testuser', 'sheet1', {});
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: [] });
        });

        it('should handle errors', async () => {
            const req = {
                user: { user_name: 'testuser' },
                body: { publisher: 'testuser', sheet: 'sheet1', payload: {} }
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const error = new Error('Test error');
            (updateService.updatePublished as jest.Mock).mockRejectedValue(error);

            await updatePublished(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateSubscription', () => {
        it('should update subscription', async () => {
            const req = {
                body: { publisher: 'testuser', sheet: 'sheet1', payload: {} }
            } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            (updateService.updateSubscription as jest.Mock).mockResolvedValue(true);

            await updateSubscription(req, res, next);

            expect(updateService.updateSubscription).toHaveBeenCalledWith('testuser', 'sheet1', {});
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: [] });
        });

        it('should handle errors', async () => {
            const req = {
                body: { publisher: 'testuser', sheet: 'sheet1', payload: {} }
            } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const error = new Error('Test error');
            (updateService.updateSubscription as jest.Mock).mockRejectedValue(error);

            await updateSubscription(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});