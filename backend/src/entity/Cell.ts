//Basic entity to represent a cell

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: String

    @Column()
    column: string

    @Column()
    row: number

    //this entity may not be neeccessary for MVP but 
    // may be usd in to store styling on database for bonus
    // example:
    // @Column()
    // cellColor: color

}
