import { Request, Response, NextFunction } from "express";

/**
 * Middleware to validate request parameters for various endpoints.
 *
 * @file validators.ts
 * @author syadav7173
 */

/**
 * Validates the presence of the publisher field in the request body.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 * 
 * @author syadav7173
 */
export const validatePublisher = (req: Request, res: Response, next: NextFunction) => {
  const { publisher } = req.body;
  if (!publisher) {
    return res.status(400).json({ success: false, message: "Publisher is required", value: [] });
  }
  next();
};

/**
 * Validates the presence of the publisher and sheet fields in the request body.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 * 
 * @author syadav7173
 */
export const validateSheet = (req: Request, res: Response, next: NextFunction) => {
  const { publisher, sheet } = req.body;
  if (!publisher || !sheet) {
    return res.status(400).json({ success: false, message: "Publisher and sheet are required", value: [] });
  }
  next();
};

/**
 * Validates the presence of the publisher, sheet, and id fields in the request body.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 * 
 * @author syadav7173
 */
export const validateUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { publisher, sheet, id } = req.body;
  if (!publisher || !sheet || !id) {
    return res.status(400).json({ success: false, message: "Publisher, sheet, and id are required", value: [] });
  }
  next();
};
