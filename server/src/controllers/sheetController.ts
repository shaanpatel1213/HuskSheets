import { Request, Response, NextFunction } from 'express';
import * as sheetService from '../services/sheetService';
import { Publisher } from '../entity/Publisher';

/**
 * Controller for handling sheet-related endpoints.
 *
 * @file sheetController.ts
 * 
 * @author syadav7173
 */

/**
 * Create a new sheet for the authenticated user.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 * 
 * @author syadav7173
 */
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
    const existingSheet = await sheetService.findSheetByNameAndPublisher(sheet, user);
    if (existingSheet) {
      return res.status(400).json({ success: false, message: `Sheet already exists: ${sheet}`, value: [] });
    }
    const newSheet = await sheetService.createSheet(user, sheet);
    res.status(200).json({ success: true, message: null, value: newSheet });
  } catch (error) {
    next(error);
  }
};

/**
 * Get sheets for a publisher.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 * 
 * @author syadav7173
 */
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
