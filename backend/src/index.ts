import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { startServer } from './app';
import { seedUsers } from './services/seedUsers';

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

initializeDatabase().then(async () => {
  await seedUsers();
  startServer();
}).catch(error => console.log(error));
