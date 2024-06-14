import { AppDataSource } from "../data-source";
import { Publisher } from "../entity/Publisher";

/**
 * This file contains services for managing publishers in the Husksheet application.
 * The services include operations for finding, creating, and retrieving all publishers.
 *
 * @file publisherService.ts
 * @author syadav7173
 */


/**
 * Finds a publisher by their username.
 *
 * @param {string} username - The username of the publisher to find.
 * @returns {Promise<Publisher | null>} The found publisher or null if not found.
 * 
 * @author syadav7173
 */
export const findPublisherByUsername = async (username: string) => {
  return await AppDataSource.manager.findOneBy(Publisher, { username });
};

/**
 * Creates a new publisher with the given username and password.
 *
 * @param {string} username - The username of the new publisher.
 * @param {string} password - The password of the new publisher.
 * @returns {Promise<Publisher>} The created publisher object.
 * 
 * @author syadav7173
 */
export const createPublisher = async (username: string, password: string) => {
  const publisher = new Publisher();
  publisher.username = username;
  publisher.password = password;
  await AppDataSource.manager.save(publisher);
  return publisher;
};

/**
 * Retrieves all publishers.
 *
 * @returns {Promise<Publisher[]>} A list of all publisher objects.
 * 
 * @author syadav7173
 */
export const getAllPublishers = async () => {
  return await AppDataSource.manager.find(Publisher);
};
