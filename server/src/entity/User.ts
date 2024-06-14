import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entity representing an authorized user.
 *
 * @file user.ts
 * @author syadav7173
 */

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  user_name: string;

  @Column()
  password: string;
}
