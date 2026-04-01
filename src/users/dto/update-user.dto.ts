import { userRole } from "../enums/role.enum"

export class UpdateStudentDto {
    nis?: number
    class?: string
}

export class UpdateTeacherDto {
    nip?: number
}

export class UpdateUserDto {
    email?: string
    name?: string
    role?: userRole
    department?: string
    pfp?: string
    student?: UpdateStudentDto
    teacher?: UpdateTeacherDto
}
