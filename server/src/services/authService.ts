import { AppDataSource } from "../data-source";
import { Publisher } from "../entity/Publisher";

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
