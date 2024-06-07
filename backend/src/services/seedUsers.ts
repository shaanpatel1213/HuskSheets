import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { Buffer } from 'buffer';

//adds 3 seeded users to database and encodes them in base64
export const seedUsers = async () => {
  const users = [
    { user_name: 'user1', password: 'password1' },
    { user_name: 'user2', password: 'password2' },
    { user_name: 'team18', password: 'qdKoHqmiP@6x`_1Q' },
  ];

  for (const user of users) {
    const encodedPassword = Buffer.from(user.password).toString('base64');
    const newUser = new User();
    newUser.user_name = user.user_name;
    newUser.password = encodedPassword;
    await AppDataSource.manager.save(newUser);
  }
};


