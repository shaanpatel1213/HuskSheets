import { registerPublisher, getAllPublishers } from '../../controllers/authController';
import * as publisherService from '../../services/publisherService';
import { Request, Response } from 'express';
import { Publisher } from '../../entity/Publisher';

describe('Auth Controller', () => {
  describe('registerPublisher', () => {
    it('should register a new publisher', async () => {
      const req = {
        user: {
          user_name: 'test_user',
          password: 'test_password',
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const findPublisherByUsernameMock = jest.spyOn(publisherService, 'findPublisherByUsername').mockResolvedValue(null);
      const createPublisherMock = jest.spyOn(publisherService, 'createPublisher').mockResolvedValue({
        id: 1,
        username: 'test_user',
        password: 'test_password',
        spreadsheets: [],
      } as Publisher);

      await registerPublisher(req, res);

      expect(findPublisherByUsernameMock).toHaveBeenCalledWith('test_user');
      expect(createPublisherMock).toHaveBeenCalledWith('test_user', 'test_password');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'test_user', value: [] });
    });
  });

  describe('getAllPublishers', () => {
    it('should get all publishers', async () => {
      const req = {} as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const publishers = [
        {
          id: 1,
          username: 'test_user1',
          password: 'test_password1',
          spreadsheets: [],
        },
        {
          id: 2,
          username: 'test_user2',
          password: 'test_password2',
          spreadsheets: [],
        },
      ] as Publisher[];

      const getAllPublishersMock = jest.spyOn(publisherService, 'getAllPublishers').mockResolvedValue(publishers);

      await getAllPublishers(req, res);

      expect(getAllPublishersMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: null,
        value: [
          { publisher: 'test_user1', sheet: null, id: null, payload: null },
          { publisher: 'test_user2', sheet: null, id: null, payload: null },
        ],
      });
    });
  });
});
