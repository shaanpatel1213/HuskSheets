import { AppDataSource } from "../data-source";
import { Publisher } from "../entity/Publisher";

/**
 * This file contains services for managing authentication within the Husksheet application.
 * The services include operations for registering publishers.
 *
 * @file authService.ts
 * @author syadav7173
 */

/**
 * Registers a new publisher with the provided username and password.
 * If the publisher already exists, it returns the existing publisher.
 *
 * @param {string} username - The username of the publisher.
 * @param {string} password - The password of the publisher.
 * @returns {Promise<Publisher>} A promise that resolves to the registered publisher.
 * @author syadav7173
 */
export const register = async (username: string, password: string) => {
  let publisher = await AppDataSource.manager.findOneBy(Publisher, { username });
  if (!publisher) {
    publisher = new Publisher();
    publisher.username = username;
    publisher.password = password;
    await AppDataSource.manager.save(publisher);
  }
  return publisher;
};
