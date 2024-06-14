import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Spreadsheet } from "./Spreadsheet";

/**
 * Represents a publisher in the Husksheet application.
 * Each publisher has a unique identifier, username, and password,
 * and is associated with multiple spreadsheets.
 *
 * @entity Publisher
 * @property {number} id - The primary key for the publisher.
 * @property {string} username - The username of the publisher.
 * @property {string} password - The password of the publisher.
 * @property {Spreadsheet[]} spreadsheets - The spreadsheets associated with the publisher.
 * 
 * @author BrandonPetersen
 */ 
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
 