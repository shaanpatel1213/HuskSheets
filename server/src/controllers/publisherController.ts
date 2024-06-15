import { Request, Response, NextFunction } from 'express';
import * as publisherService from '../services/publisherService';

/**
 * Controller for handling publisher-related endpoints.
 *
 * @file publisherController.ts
 * 
 * @author syadav7173
 */

/**
 * Get all publishers.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 * 
 * @status {200} - Sheet created successfully.
 * 
 * @author syadav7173
 */
export const getPublishers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await publisherService.getAllPublishers();
    res.status(200).json({ success: true, message: null, value: result });
  } catch (error) {
    next(error);
  }
};
