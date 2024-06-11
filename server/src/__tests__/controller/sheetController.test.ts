import { Request, Response, NextFunction } from 'express';
import { createNewSheet, getSheets, deleteSheet } from '../../controllers/sheetController';
import * as sheetService from '../../services/sheetService';

// Ownership : Shaanpatel1213
jest.mock('../../services/sheetService');

describe('sheetController', () => {
    describe('createNewSheet', () => {
        it('should return 401 if publisher is not the user', async () => {
            const req = {
                user: { user_name: 'testuser' },
                body: { publisher: 'otheruser', sheet: 'sheet1' }
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            await createNewSheet(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Unauthorized: sender is not owner of sheet',
                value: []
            });
        });

        it('should return 400 if publisher not found', async () => {
            const req = {
                user: { user_name: 'testuser' },
                body: { publisher: 'testuser', sheet: 'sheet1' }
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue(null);

            await createNewSheet(req, res, next);

            expect(sheetService.findPublisherByUsername).toHaveBeenCalledWith('testuser');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Publisher not found',
                value: []
            });
        });

        it('should create a new sheet for the publisher', async () => {
            const req = {
                user: { user_name: 'testuser' },
                body: { publisher: 'testuser', sheet: 'sheet1' }
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const user = { user_name: 'testuser' };
            (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue(user);
            (sheetService.createSheet as jest.Mock).mockResolvedValue(true);

            await createNewSheet(req, res, next);

            expect(sheetService.findPublisherByUsername).toHaveBeenCalledWith('testuser');
            expect(sheetService.createSheet).toHaveBeenCalledWith(user, 'sheet1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: [] });
        });

        it('should handle errors', async () => {
            const req = {
                user: { user_name: 'testuser' },
                body: { publisher: 'testuser', sheet: 'sheet1' }
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const error = new Error('Test error');
            (sheetService.findPublisherByUsername as jest.Mock).mockRejectedValue(error);

            await createNewSheet(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getSheets', () => {
        it('should return 400 if publisher not found', async () => {
            const req = { body: { publisher: 'testuser' } } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue(null);

            await getSheets(req, res, next);

            expect(sheetService.findPublisherByUsername).toHaveBeenCalledWith('testuser');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Publisher not found',
                value: []
            });
        });

        it('should return sheets for the publisher', async () => {
            const req = { body: { publisher: 'testuser' } } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const user = { user_name: 'testuser' };
            const sheets = [{ name: 'sheet1' }, { name: 'sheet2' }];
            (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue(user);
            (sheetService.getSheetsByPublisher as jest.Mock).mockResolvedValue(sheets);

            await getSheets(req, res, next);

            expect(sheetService.findPublisherByUsername).toHaveBeenCalledWith('testuser');
            expect(sheetService.getSheetsByPublisher).toHaveBeenCalledWith(user);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: sheets });
        });

        it('should handle errors', async () => {
            const req = { body: { publisher: 'testuser' } } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const error = new Error('Test error');
            (sheetService.findPublisherByUsername as jest.Mock).mockRejectedValue(error);

            await getSheets(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteSheet', () => {
        it('should return 400 if publisher not found', async () => {
            const req = { body: { publisher: 'testuser', sheet: 'sheet1' } } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue(null);

            await deleteSheet(req, res, next);

            expect(sheetService.findPublisherByUsername).toHaveBeenCalledWith('testuser');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Publisher not found',
                value: []
            });
        });

        it('should return 400 if sheet not found', async () => {
            const req = { body: { publisher: 'testuser', sheet: 'sheet1' } } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const user = { user_name: 'testuser' };
            (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue(user);
            (sheetService.findSheetByNameAndPublisher as jest.Mock).mockResolvedValue(null);

            await deleteSheet(req, res, next);

            expect(sheetService.findPublisherByUsername).toHaveBeenCalledWith('testuser');
            expect(sheetService.findSheetByNameAndPublisher).toHaveBeenCalledWith('sheet1', user);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Sheet not found',
                value: []
            });
        });

        it('should delete the sheet', async () => {
            const req = { body: { publisher: 'testuser', sheet: 'sheet1' } } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const user = { user_name: 'testuser' };
            const sheet = { name: 'sheet1' };
            (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue(user);
            (sheetService.findSheetByNameAndPublisher as jest.Mock).mockResolvedValue(sheet);
            (sheetService.deleteSheet as jest.Mock).mockResolvedValue(true);

            await deleteSheet(req, res, next);

            expect(sheetService.findPublisherByUsername).toHaveBeenCalledWith('testuser');
            expect(sheetService.findSheetByNameAndPublisher).toHaveBeenCalledWith('sheet1', user);
            expect(sheetService.deleteSheet).toHaveBeenCalledWith(sheet);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: [] });
        });

        it('should handle errors', async () => {
            const req = { body: { publisher: 'testuser', sheet: 'sheet1' } } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn() as NextFunction;

            const error = new Error('Test error');
            (sheetService.findPublisherByUsername as jest.Mock).mockRejectedValue(error);

            await deleteSheet(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
