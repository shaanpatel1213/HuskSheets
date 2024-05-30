import { AppDataSource } from "./data-source"
import { Publisher } from "./entity/Publisher"
import { startServer } from './app';

AppDataSource.initialize().then(async () => {

    startServer();
}).catch(error => console.log(error))
