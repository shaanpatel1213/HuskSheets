import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

//entity representing an authorized user

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  user_name: string;

  @Column()
  password: string;
}
