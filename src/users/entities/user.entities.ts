import { userRole } from "../enums/role.enum"
import { Student } from "./student.entities"
import { Teacher } from "./teacher.entities"

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne
} from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ unique: true })
    email: string

    @Column({ unique: true })
    name: string

    @Column({ type: "enum", enum: userRole, default: userRole.student })
    role: userRole

    @Column()
    department: string

    @Column({ select: false })
    password: string

    @Column({ nullable: true })
    firebase_token: string

    @Column({ nullable: true })
    refreshToken: string

    @Column({ nullable: true, select: false })
    refreshTokenExp: Date
    
    @Column({ default: true })
    is_active: boolean

    @OneToOne(() => Student, (student) => student.user)
    student: Student

    @OneToOne(() => Teacher, (teacher) => teacher.user)
    teacher: Teacher

    @Column({ nullable: true })
    pfp: string
}