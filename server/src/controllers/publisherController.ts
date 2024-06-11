import { Request, Response, NextFunction } from 'express';
import * as publisherService from '../services/publisherService';

export const getPublishers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await publisherService.getAllPublishers();
    res.status(200).json({ success: true, message: null, value: result });
  } catch (error) {
    next(error);
  }
};
