import { User } from "./user.entities"

import {
    Entity,
    Column,
    PrimaryColumn,
    OneToOne,
    JoinColumn
} from "typeorm"
import { Exclude } from "class-transformer"

@Entity()
export class Teacher {
    @Exclude({ toPlainOnly: true })
    @PrimaryColumn("uuid", { select: false })
    user_id: string
    
    @Column({ type: "bigint" })
    nip: number

    @OneToOne(() => User, (user) => user.teacher, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User
}