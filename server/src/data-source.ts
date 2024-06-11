//config file that provides the express server the information
// to locate the database

import "reflect-metadata"
import { DataSource } from "typeorm"
import { Publisher } from "./entity/Publisher"
import { User } from './entity/User';
import { Spreadsheet } from "./entity/Spreadsheet";
import { Update } from "./entity/Update";
import { Cell } from "./entity/Cell";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "user1",
    password: "password1",
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [User, Publisher, Cell, Spreadsheet, Update],
    migrations: [],
    subscribers: [],
})
