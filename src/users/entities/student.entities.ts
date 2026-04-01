import { User } from "./user.entities"
import { Exclude } from "class-transformer"

import {
    Entity,
    Column,
    PrimaryColumn,
    OneToOne,
    JoinColumn
} from "typeorm"

@Entity()
export class Student {
    @Exclude({ toPlainOnly: true })
    @PrimaryColumn("uuid", { select: false })
    user_id: string
    
    @Column({ type: "bigint" })
    nis: number

    @Column()
    class: string

    @OneToOne(() => User, (user) => user.student, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User
}