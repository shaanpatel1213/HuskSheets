import { getPublishers } from '../../controllers/publisherController';
import * as publisherService from '../../services/publisherService';
import { Request, Response, NextFunction } from 'express';
import { Publisher } from '../../entity/Publisher';

jest.mock('../../services/updateService');

describe('Publisher Controller', () => {
  describe('getPublishers', () => {
    it('should return a list of publishers', async () => {
      const req = {} as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const publishers: Publisher[] = [
        {
          id: 1,
          username: 'publisher1',
          password: 'password1',
          spreadsheets: [],
        },
        {
          id: 2,
          username: 'publisher2',
          password: 'password2',
          spreadsheets: [],
        },
      ];

      jest.spyOn(publisherService, 'getAllPublishers').mockResolvedValue(publishers);

      await getPublishers(req, res, next);

      expect(publisherService.getAllPublishers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: publishers });
    });

    it('should handle errors', async () => {
      const req = {} as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const error = new Error('Test error');

      jest.spyOn(publisherService, 'getAllPublishers').mockRejectedValue(error);

      await getPublishers(req, res, next);

      expect(publisherService.getAllPublishers).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
