import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Publisher } from "./Publisher";
import { Cell } from "./Cell";
import { Update } from "./Update";

/**
 * Represents a spreadsheet in the Husksheet application.
 * Each spreadsheet has a unique identifier, name, and associations with a publisher,
 * subscribers, cells, and updates.
 *
 * @entity Spreadsheet
 * @property {number} idRef - The primary key for the spreadsheet.
 * @property {string} name - The name of the spreadsheet.
 * @property {Publisher} publisher - The publisher associated with the spreadsheet.
 * @property {Publisher[]} subscribers - The subscribers of the spreadsheet.
 * @property {Cell[]} cells - The cells contained in the spreadsheet.
 * @property {Update[]} updates - The updates applied to the spreadsheet.
 * 
 * @author BrandonPetersen
 */
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
