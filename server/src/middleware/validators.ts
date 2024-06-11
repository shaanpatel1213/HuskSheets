import { Request, Response, NextFunction } from "express";

export const validatePublisher = (req: Request, res: Response, next: NextFunction) => {
  const { publisher } = req.body;
  if (!publisher) {
    return res.status(400).json({ success: false, message: "Publisher is required", value: [] });
  }
  next();
};

export const validateSheet = (req: Request, res: Response, next: NextFunction) => {
  const { publisher, sheet } = req.body;
  if (!publisher || !sheet) {
    return res.status(400).json({ success: false, message: "Publisher and sheet are required", value: [] });
  }
  next();
};

export const validateUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { publisher, sheet, id } = req.body;
  if (!publisher || !sheet || !id) {
    return res.status(400).json({ success: false, message: "Publisher, sheet, and id are required", value: [] });
  }
  next();
};
