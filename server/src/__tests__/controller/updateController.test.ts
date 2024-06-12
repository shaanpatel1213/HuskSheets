import { Request, Response, NextFunction } from 'express';
import * as updateController from '../../controllers/updateController';
import * as updateService from '../../services/updateService';

jest.mock('../../services/updateService');

describe('updateController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {},
      user: { user_name: 'test_user', password: 'test_password' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('getUpdatesForSubscription', () => {
    it('should get updates for a subscription', async () => {
      req.body = { publisher: 'test_publisher', sheet: 'test_sheet', id: 1 };

      const updates = [{ id: 1, update: 'test_update' }];
      (updateService.getUpdatesForSubscription as jest.Mock).mockResolvedValue(updates);

      await updateController.getUpdatesForSubscription(req as Request, res as Response, next);

      expect(updateService.getUpdatesForSubscription).toHaveBeenCalledWith('test_publisher', 'test_sheet', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: updates });
    });

    it('should call next with error if service throws', async () => {
      req.body = { publisher: 'test_publisher', sheet: 'test_sheet', id: 1 };

      const error = new Error('service error');
      (updateService.getUpdatesForSubscription as jest.Mock).mockRejectedValue(error);

      await updateController.getUpdatesForSubscription(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUpdatesForPublished', () => {
    it('should get updates for published sheets if publisher matches user_name', async () => {
      req.body = { publisher: 'test_user', sheet: 'test_sheet', id: 1 };

      const updates = [{ id: 1, update: 'test_update' }];
      (updateService.getUpdatesForPublished as jest.Mock).mockResolvedValue(updates);

      await updateController.getUpdatesForPublished(req as Request, res as Response, next);

      expect(updateService.getUpdatesForPublished).toHaveBeenCalledWith('test_user', 'test_sheet', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: updates });
    });

    it('should return 401 if publisher does not match user_name', async () => {
      req.body = { publisher: 'wrong_user', sheet: 'test_sheet', id: 1 };

      await updateController.getUpdatesForPublished(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized: sender is not owner of sheet",
        value: [],
      });
    });

    it('should call next with error if service throws', async () => {
      req.body = { publisher: 'test_user', sheet: 'test_sheet', id: 1 };

      const error = new Error('service error');
      (updateService.getUpdatesForPublished as jest.Mock).mockRejectedValue(error);

      await updateController.getUpdatesForPublished(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updatePublished', () => {
    it('should update published sheet if publisher matches user_name', async () => {
      req.body = { publisher: 'test_user', sheet: 'test_sheet', payload: 'test_payload' };

      await updateController.updatePublished(req as Request, res as Response, next);

      expect(updateService.updatePublished).toHaveBeenCalledWith('test_user', 'test_sheet', 'test_payload');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: [] });
    });

    it('should return 401 if publisher does not match user_name', async () => {
      req.body = { publisher: 'wrong_user', sheet: 'test_sheet', payload: 'test_payload' };

      await updateController.updatePublished(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized: sender is not owner of sheet",
        value: [],
      });
    });

    it('should call next with error if service throws', async () => {
      req.body = { publisher: 'test_user', sheet: 'test_sheet', payload: 'test_payload' };

      const error = new Error('service error');
      (updateService.updatePublished as jest.Mock).mockRejectedValue(error);

      await updateController.updatePublished(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription', async () => {
      req.body = { publisher: 'test_publisher', sheet: 'test_sheet', payload: 'test_payload' };

      await updateController.updateSubscription(req as Request, res as Response, next);

      expect(updateService.updateSubscription).toHaveBeenCalledWith('test_publisher', 'test_sheet', 'test_payload');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: [] });
    });

    it('should call next with error if service throws', async () => {
      req.body = { publisher: 'test_publisher', sheet: 'test_sheet', payload: 'test_payload' };

      const error = new Error('service error');
      (updateService.updateSubscription as jest.Mock).mockRejectedValue(error);

      await updateController.updateSubscription(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
