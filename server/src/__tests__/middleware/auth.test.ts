import { Request, Response, NextFunction } from 'express';
import { User } from '../../entity/User';
import { AppDataSource } from '../../data-source';
import auth from '../../middleware/auth';
import { Buffer } from 'buffer';

// Ownership : Shaanpatel1213
jest.mock('../../data-source', () => ({
    AppDataSource: {
        manager: {
            findOne: jest.fn()
        }
    }
}));

describe('auth middleware', () => {
    it('should return 401 if no authorization header is present', async () => {
        const req = {
            headers: {}
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        const next = jest.fn() as NextFunction;

        await auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Unauthorized',
            value: []
        });
    });

    it('should return 401 if authorization header does not start with Basic', async () => {
        const req = {
            headers: {
                authorization: 'Bearer token'
            }
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        const next = jest.fn() as NextFunction;

        await auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Unauthorized',
            value: []
        });
    });

    it('should return 401 if user is not found', async () => {
        const req = {
            headers: {
                authorization: 'Basic dGVzdHVzZXI6dGVzdHBhc3N3b3Jk'
            }
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        const next = jest.fn() as NextFunction;

        (AppDataSource.manager.findOne as jest.Mock).mockResolvedValue(null);

        await auth(req, res, next);

        expect(AppDataSource.manager.findOne).toHaveBeenCalledWith(User, { where: { user_name: 'testuser' } });
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Unauthorized',
            value: []
        });
    });

    it('should return 401 if password is incorrect', async () => {
        const req = {
            headers: {
                authorization: 'Basic dGVzdHVzZXI6dGVzdHBhc3N3b3Jk'
            }
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        const next = jest.fn() as NextFunction;

        const user = {
            user_name: 'testuser',
            password: Buffer.from('wrongpassword').toString('base64')
        };
        (AppDataSource.manager.findOne as jest.Mock).mockResolvedValue(user);

        await auth(req, res, next);

        expect(AppDataSource.manager.findOne).toHaveBeenCalledWith(User, { where: { user_name: 'testuser' } });
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Unauthorized',
            value: []
        });
    });

    it('should call next if authentication is successful', async () => {
        const req = {
            headers: {
                authorization: 'Basic dGVzdHVzZXI6dGVzdHBhc3N3b3Jk'
            }
        } as Request;

        const res = {} as Response;

        const next = jest.fn() as NextFunction;

        const user = {
            user_name: 'testuser',
            password: Buffer.from('testpassword').toString('base64')
        };
        (AppDataSource.manager.findOne as jest.Mock).mockResolvedValue(user);

        await auth(req, res, next);

        expect(AppDataSource.manager.findOne).toHaveBeenCalledWith(User, { where: { user_name: 'testuser' } });
        expect(req.user).toEqual({ user_name: 'testuser', password: 'testpassword' });
        expect(next).toHaveBeenCalled();
    });
});
