import { Request, Response, NextFunction } from 'express';
import * as updateService from '../services/updateService';

export const getUpdatesForSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const { publisher, sheet, id } = req.body;
  try {
    const result = await updateService.getUpdatesForSubscription(publisher, sheet, id);
    res.status(200).json({ success: true, message: null, value: result });
  } catch (error) {
    next(error);
  }
};

export const getUpdatesForPublished = async (req: Request, res: Response, next: NextFunction) => {
  const { user_name } = req.user!;
  const { publisher, sheet, id } = req.body;
  if (publisher !== user_name) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: sender is not owner of sheet",
      value: [],
    });
  }
  try {
    const result = await updateService.getUpdatesForPublished(publisher, sheet, id);
    res.status(200).json({ success: true, message: null, value: result });
  } catch (error) {
    next(error);
  }
};

export const updatePublished = async (req: Request, res: Response, next: NextFunction) => {
  const { user_name } = req.user!;
  const { publisher, sheet, payload } = req.body;
  if (publisher !== user_name) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: sender is not owner of sheet",
      value: [],
    });
  }
  try {
    await updateService.updatePublished(publisher, sheet, payload);
    res.status(200).json({ success: true, message: null, value: [] });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const { publisher, sheet, payload } = req.body;
  try {
    await updateService.updateSubscription(publisher, sheet, payload);
    res.status(200).json({ success: true, message: null, value: [] });
  } catch (error) {
    next(error);
  }
};
