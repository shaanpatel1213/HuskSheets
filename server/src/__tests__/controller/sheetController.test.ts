import { Request, Response, NextFunction } from 'express';
import * as sheetController from '../../controllers/sheetController';
import * as sheetService from '../../services/sheetService';
import { Publisher } from '../../entity/Publisher';
import { Spreadsheet } from '../../entity/Spreadsheet';

jest.mock('../../services/sheetService');

/** Ownership: @author syadav7173 */
describe('sheetController', () => {
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

/** Ownership: @author syadav7173 */
  describe('createNewSheet', () => {
    it('should create a new sheet for the authenticated user', async () => {
      req.body = { publisher: 'test_user', sheet: 'test_sheet' };

      (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue({ username: 'test_user' });
      (sheetService.createSheet as jest.Mock).mockResolvedValue({ idRef: 1, name: 'test_sheet' });

      await sheetController.createNewSheet(req as Request, res as Response, next);

      expect(sheetService.findPublisherByUsername).toHaveBeenCalledWith('test_user');
      expect(sheetService.createSheet).toHaveBeenCalledWith({ username: 'test_user' }, 'test_sheet');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: { idRef: 1, name: 'test_sheet' } });
    });

    it('should return 401 if the publisher is not the authenticated user', async () => {
      req.body = { publisher: 'wrong_user', sheet: 'test_sheet' };

      await sheetController.createNewSheet(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized: sender is not owner of sheet",
        value: [],
      });
    });

    it('should return 400 if the publisher is not found', async () => {
      req.body = { publisher: 'test_user', sheet: 'test_sheet' };

      (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue(null);

      await sheetController.createNewSheet(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Publisher not found", value: [] });
    });

    it('should call next with error if service throws', async () => {
      req.body = { publisher: 'test_user', sheet: 'test_sheet' };

      const error = new Error('service error');
      (sheetService.findPublisherByUsername as jest.Mock).mockRejectedValue(error);

      await sheetController.createNewSheet(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

/** Ownership: @author syadav7173 */
  describe('getSheets', () => {
    it('should get sheets for a publisher', async () => {
      req.body = { publisher: 'test_user' };

      const sheets = [{ idRef: 1, name: 'test_sheet' }];
      (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue({ username: 'test_user' });
      (sheetService.getSheetsByPublisher as jest.Mock).mockResolvedValue(sheets);

      await sheetController.getSheets(req as Request, res as Response, next);

      expect(sheetService.findPublisherByUsername).toHaveBeenCalledWith('test_user');
      expect(sheetService.getSheetsByPublisher).toHaveBeenCalledWith({ username: 'test_user' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: sheets });
    });

    it('should return 400 if the publisher is not found', async () => {
      req.body = { publisher: 'test_user' };

      (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue(null);

      await sheetController.getSheets(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Publisher not found", value: [] });
    });

    it('should call next with error if service throws', async () => {
      req.body = { publisher: 'test_user' };

      const error = new Error('service error');
      (sheetService.findPublisherByUsername as jest.Mock).mockRejectedValue(error);

      await sheetController.getSheets(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

/** Ownership: @author syadav7173 */
  describe('deleteSheet', () => {
    it('should delete a sheet for the authenticated user', async () => {
      req.body = { publisher: 'test_user', sheet: 'test_sheet' };

      const publisher = { username: 'test_user' } as Publisher;
      const spreadsheet = { idRef: 1, name: 'test_sheet' } as Spreadsheet;

      (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue(publisher);
      (sheetService.findSheetByNameAndPublisher as jest.Mock).mockResolvedValue(spreadsheet);
      (sheetService.deleteSheet as jest.Mock).mockResolvedValue(true);

      await sheetController.deleteSheet(req as Request, res as Response, next);

      expect(sheetService.findPublisherByUsername).toHaveBeenCalledWith('test_user');
      expect(sheetService.findSheetByNameAndPublisher).toHaveBeenCalledWith('test_sheet', publisher);
      expect(sheetService.deleteSheet).toHaveBeenCalledWith(spreadsheet);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: null, value: [] });
    });

    it('should return 400 if the publisher is not found', async () => {
      req.body = { publisher: 'test_user', sheet: 'test_sheet' };

      (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue(null);

      await sheetController.deleteSheet(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Publisher not found", value: [] });
    });

    it('should return 400 if the sheet is not found', async () => {
      req.body = { publisher: 'test_user', sheet: 'test_sheet' };

      const publisher = { username: 'test_user' } as Publisher;

      (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue(publisher);
      (sheetService.findSheetByNameAndPublisher as jest.Mock).mockResolvedValue(null);

      await sheetController.deleteSheet(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Sheet not found", value: [] });
    });

    it('should return 500 if deletion fails', async () => {
      req.body = { publisher: 'test_user', sheet: 'test_sheet' };

      const publisher = { username: 'test_user' } as Publisher;
      const spreadsheet = { idRef: 1, name: 'test_sheet' } as Spreadsheet;

      (sheetService.findPublisherByUsername as jest.Mock).mockResolvedValue(publisher);
      (sheetService.findSheetByNameAndPublisher as jest.Mock).mockResolvedValue(spreadsheet);
      (sheetService.deleteSheet as jest.Mock).mockResolvedValue(false);

      await sheetController.deleteSheet(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Failed to delete spreadsheet", value: [] });
    });
  });
});
