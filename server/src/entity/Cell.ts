import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Spreadsheet } from "./Spreadsheet";
/**
 * Represents a cell within a spreadsheet in the Husksheet application.
 * Each cell is associated with a specific spreadsheet and has a unique
 * identifier, column, row, and content.
 *
 * @entity Cell
 * @property {number} id - The primary key for the cell.
 * @property {Spreadsheet} spreadsheet - The spreadsheet this cell belongs to.
 * @property {number} column - The column index of the cell.
 * @property {number} row - The row index of the cell.
 * @property {string} content - The content of the cell.
 * 
 * @author BrandonPetersen
 */
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
