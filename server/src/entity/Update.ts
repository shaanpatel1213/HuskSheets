import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"; 
import { Spreadsheet } from "./Spreadsheet"; 
 
/**
 * Represents an update applied to a spreadsheet in the Husksheet application.
 * Each update has a unique identifier, is associated with a specific spreadsheet,
 * and contains a payload with the update information.
 *
 * @entity Update
 * @property {number} id - The primary key for the update.
 * @property {Spreadsheet} spreadsheet - The spreadsheet this update belongs to.
 * @property {string} payload - The update payload.
 * 
 * @author BrandonPetersen
 */
@Entity() 
export class Update { 
    @PrimaryGeneratedColumn() 
    id: number; 
 
    @ManyToOne(() => Spreadsheet, spreadsheet => spreadsheet.updates, { onDelete: "CASCADE" }) 
    spreadsheet: Spreadsheet; 
 
    @Column("text") 
    payload: string; 
} 
