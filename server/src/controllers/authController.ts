import { Request, Response } from "express";
import { findPublisherByUsername, createPublisher, getAllPublishers as getAllPublishersService } from "../services/publisherService";

//register a publisher
export const registerPublisher = async (req: Request, res: Response) => {
  const { user_name, password } = req.user!;

  let publisher = await findPublisherByUsername(user_name);
  if (!publisher) {
    publisher = await createPublisher(user_name, password);
  }

  res.status(200).json({ success: true, message: user_name, value: [] });
};

//get all publishers
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
