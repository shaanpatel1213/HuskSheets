import { Request, Response } from 'express';
import { registerPublisher, getAllPublishers } from '../../controllers/authController';
import { findPublisherByUsername, createPublisher, getAllPublishers as getAllPublishersService } from '../../services/publisherService';

// Ownership : Shaanpatel1213
jest.mock('../../services/publisherService');

describe('authController', () => {
    describe('registerPublisher', () => {
        it('should register a new publisher if not found', async () => {
            const req = {
                user: { user_name: 'testuser', password: 'password123' }
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;

            (findPublisherByUsername as jest.Mock).mockResolvedValue(null);
            (createPublisher as jest.Mock).mockResolvedValue({ user_name: 'testuser' });

            await registerPublisher(req, res);

            expect(findPublisherByUsername).toHaveBeenCalledWith('testuser');
            expect(createPublisher).toHaveBeenCalledWith('testuser', 'password123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: 'testuser', value: [] });
        });

        it('should return existing publisher if found', async () => {
            const req = {
                user: { user_name: 'testuser', password: 'password123' }
            } as unknown as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;

            const existingPublisher = { user_name: 'testuser' };
            (findPublisherByUsername as jest.Mock).mockResolvedValue(existingPublisher);

            await registerPublisher(req, res);

            expect(findPublisherByUsername).toHaveBeenCalledWith('testuser');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: 'testuser', value: [] });
        });
    });

    describe('getAllPublishers', () => {
        it('should return all publishers', async () => {
            const req = {} as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;

            const publishers = [
                { username: 'publisher1' },
                { username: 'publisher2' }
            ];
            (getAllPublishersService as jest.Mock).mockResolvedValue(publishers);

            await getAllPublishers(req, res);

            const expectedResponse = [
                { publisher: 'publisher1', sheet: null, id: null, payload: null },
                { publisher: 'publisher2', sheet: null, id: null, payload: null }
            ];

            expect(getAllPublishersService).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: expectedResponse });
        });
    });
});
