import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Publisher } from "./Publisher";
import { Cell } from "./Cell";
import { Update } from "./Update";

@Entity()
export class Spreadsheet {
    @PrimaryGeneratedColumn()
    idRef: number; // Primary key

    @Column()
    name: string;

    @ManyToOne(() => Publisher, publisher => publisher.spreadsheets)
    publisher: Publisher;

    @ManyToMany(() => Publisher)
    @JoinTable()
    subscribers: Publisher[];

    @OneToMany(() => Cell, cell => cell.spreadsheet, { cascade: true })
    cells: Cell[];

    @OneToMany(() => Update, update => update.spreadsheet, { cascade: true })
    updates: Update[];
}
