import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Spreadsheet } from "./Spreadsheet";

@Entity()
export class Cell {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Spreadsheet, (spreadsheet) => spreadsheet.cells, { onDelete: "CASCADE" })
    spreadsheet: Spreadsheet;

    @Column()
    column: number;

    @Column()
    row: number;

    @Column("text")
    content: string;
}
