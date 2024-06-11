import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Spreadsheet } from "./Spreadsheet";

@Entity()
export class Update {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Spreadsheet, spreadsheet => spreadsheet.updates)
    spreadsheet: Spreadsheet;

    @Column("text")
    payload: string;
}
