import { Request, Response, NextFunction } from 'express';
import * as sheetService from '../services/sheetService';
import { Publisher } from '../entity/Publisher';

//create a new sheet for the authenticated user
export const createNewSheet = async (req: Request, res: Response, next: NextFunction) => {
  const { user_name } = req.user!;
  const { publisher, sheet } = req.body;
  if (publisher !== user_name) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: sender is not owner of sheet",
      value: [],
    });
  }
  try {
    const user = await sheetService.findPublisherByUsername(publisher);
    if (!user) {
      return res.status(400).json({ success: false, message: "Publisher not found", value: [] });
    }
    await sheetService.createSheet(user, sheet);
    res.status(200).json({ success: true, message: null, value: [] });
  } catch (error) {
    next(error);
  }
};

//get sheets for a publisher
export const getSheets = async (req: Request, res: Response, next: NextFunction) => {
  const { publisher } = req.body;
  try {
    const user = await sheetService.findPublisherByUsername(publisher);
    if (!user) {
      return res.status(400).json({ success: false, message: "Publisher not found", value: [] });
    }
    const result = await sheetService.getSheetsByPublisher(user);
    res.status(200).json({ success: true, message: null, value: result });
  } catch (error) {
    next(error);
  }
};

// Delete a sheet for the authenticated user
export const deleteSheet = async (req: Request, res: Response, next: NextFunction) => {
  const { publisher, sheet } = req.body;
  try {
    const user = await sheetService.findPublisherByUsername(publisher);
    if (!user) {
      return res.status(400).json({ success: false, message: "Publisher not found", value: [] });
    }
    const spreadsheet = await sheetService.findSheetByNameAndPublisher(sheet, user);
    if (!spreadsheet) {
      return res.status(400).json({ success: false, message: "Sheet not found", value: [] });
    }
    const success = await sheetService.deleteSheet(spreadsheet);
    if (success) {
      res.status(200).json({ success: true, message: null, value: [] });
    } else {
      res.status(500).json({ success: false, message: "Failed to delete spreadsheet", value: [] });
    }
  } catch (error) {
    next(error);
  }
};