//Basic entity to represent a spreadsheet

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Spreadsheet {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    primaryUserID: number

    @Column()
    sheetData: string[][]

    @Column()
    guest1UserID: number

    @Column()
    guest2UserID: number

    @Column()
    guest3UserID: number

    @Column()
    guest4UserID: number

    @Column()
    guest5UserID: number

}