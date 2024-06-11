import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Spreadsheet } from "./Spreadsheet";

@Entity()
export class Publisher {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @OneToMany(() => Spreadsheet, spreadsheet => spreadsheet.publisher)
    spreadsheets: Spreadsheet[];
}
