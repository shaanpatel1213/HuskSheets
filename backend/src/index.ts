import { AppDataSource } from "./data-source"
import { User } from "./entity/User"
import { startServer } from './app';

AppDataSource.initialize().then(async () => {

    console.log("Inserting a new user into the database...")
    const user = new User()
    user.firstName = "Brandon"
    user.lastName = "Petersen"
    user.email = "brandonPetersen@gmail.com"
    user.password = "password123";
    await AppDataSource.manager.save(user)
    console.log("Saved a new user with id: " + user.id)

    console.log("Loading users from the database...")
    const users = await AppDataSource.manager.find(User)
    console.log("Loaded users: ", users)
    startServer();
}).catch(error => console.log(error))
