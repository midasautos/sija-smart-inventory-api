import { userRole } from "../enums/role.enum"

export class CreateStudentDto {
    nis: number
    class: string
}

export class CreateTeacherDto {
    nip: number
}

export class CreateUserDto {
    email: string
    name: string
    role: userRole
    department: string
    password?: string
    firebase_token?: string
    student?: CreateStudentDto
    teacher?: CreateTeacherDto
}
