import { Request, Response } from "express";
import { findPublisherByUsername, createPublisher, getAllPublishers as getAllPublishersService } from "../services/publisherService";

/**
 * Controller for handling authentication-related endpoints.
 *
 * @file authController.ts
 * @author syadav7173
 */

/**
 * Register a publisher.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<void>}
 * @author syadav7173
 */
export const registerPublisher = async (req: Request, res: Response) => {
  const { user_name, password } = req.user!;

  let publisher = await findPublisherByUsername(user_name);
  if (!publisher) {
    publisher = await createPublisher(user_name, password);
  }

  res.status(200).json({ success: true, message: user_name, value: [] });
};

/**
 * Get all publishers.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {Promise<void>}
 * 
 * @author syadav7173
 */
export const getAllPublishers = async (req: Request, res: Response) => {
  const publishers = await getAllPublishersService();
  const result = publishers.map((publisher) => ({
    publisher: publisher.username,
    sheet: null,
    id: null,
    payload: null,
  }));
  res.status(200).json({ success: true, message: null, value: result });
};
