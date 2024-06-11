import { AppDataSource } from "../data-source";
import { Publisher } from "../entity/Publisher";

export const findPublisherByUsername = async (username: string) => {
  return await AppDataSource.manager.findOneBy(Publisher, { username });
};

export const createPublisher = async (username: string, password: string) => {
  const publisher = new Publisher();
  publisher.username = username;
  publisher.password = password;
  await AppDataSource.manager.save(publisher);
  return publisher;
};

export const getAllPublishers = async () => {
  return await AppDataSource.manager.find(Publisher);
};
