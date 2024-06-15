import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { startServer } from './app';
import { seedUsers } from './middleware/seedUsers';

/**
 * Initializes the database by connecting to the data source, dropping the User table if it exists,
 * and recreating the User table with the given schema.
 *
 * @function
 * @returns {Promise<void>} - A promise that resolves when the database has been initialized.
 * 
 * @author syadav7173
 */
const initializeDatabase = async () => {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();
  
  await queryRunner.connect();

  // Drop the User table if it exists
  await queryRunner.query(`DROP TABLE IF EXISTS "user"`);

  // Recreate the User table
  await queryRunner.query(`
    CREATE TABLE "user" (
      "id" SERIAL PRIMARY KEY,
      "user_name" character varying NOT NULL,
      "password" character varying NOT NULL,
      CONSTRAINT "UQ_user_user_name" UNIQUE ("user_name")
    )
  `);

  await queryRunner.release();
};

/**
 * Initializes the database and seeds users, then starts the server.
 *
 * @function
 * @returns {void}
 * 
 * @author syadav7173
 */
initializeDatabase().then(async () => {
  await seedUsers();
  startServer();
}).catch(error => console.log(error));
