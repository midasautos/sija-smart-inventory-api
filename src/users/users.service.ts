import * as bcrypt from "bcrypt"
import { Repository } from "typeorm"
import { userRole } from "./enums/role.enum"
import { User } from "./entities/user.entities"
import { InjectRepository } from "@nestjs/typeorm"
import { Student } from "./entities/student.entities"
import { Teacher } from "./entities/teacher.entities"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"

import {
	BadRequestException,
	Injectable,
	NotFoundException
} from "@nestjs/common"

export type UserSelfUpdatePayload = {
	email?: string
	name?: string
	department?: string
}

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Student)
		private readonly studentRepository: Repository<Student>,
		@InjectRepository(Teacher)
		private readonly teacherRepository: Repository<Teacher>
	) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		this.validateRolePayload(createUserDto.role, createUserDto)

		const rawPassword = this.resolveCreatePassword(createUserDto)
		const hashedPassword = await bcrypt.hash(rawPassword, 10)

		const user = this.userRepository.create({
			email: createUserDto.email,
			name: createUserDto.name,
			role: createUserDto.role,
			department: createUserDto.department,
			password: hashedPassword,
			firebase_token: createUserDto.firebase_token
		})

		const savedUser = await this.userRepository.save(user)
		await this.saveProfileForRole(savedUser.id, createUserDto.role, createUserDto)

		return this.findOneForCreateResponse(savedUser.id, createUserDto.role)
	}

	async findAll(): Promise<User[]> {
		return this.userRepository.find({
			relations: {
				student: true,
				teacher: true,
			},
		})
	}

	async findOne(id: string): Promise<User> {
		const user = await this.userRepository.findOne({
			where: { id },
			relations: {
				student: true,
				teacher: true,
			},
		})

		if (!user) {
			throw new NotFoundException("User not found")
		}

		return user
	}

	async findByEmailWithPassword(email: string): Promise<User | null> {
		return this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.student', 'student')
			.leftJoinAndSelect('user.teacher', 'teacher')
			.addSelect('user.password')
			.where('user.email = :email', { email })
			.getOne()
	}

	async findStudentByNis(nis: string | number): Promise<User | null> {
		const student = await this.studentRepository.findOne({
			where: { nis: Number(nis) },
			relations: { user: true },
		})

		if (!student?.user) {
			return null
		}

		return this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.student', 'student')
			.leftJoinAndSelect('user.teacher', 'teacher')
			.addSelect('user.password')
			.where('user.id = :id', { id: student.user.id })
			.getOne()
	}

	async findTeacherByNip(nip: string | number): Promise<User | null> {
		const teacher = await this.teacherRepository.findOne({
			where: { nip: Number(nip) },
			relations: { user: true },
		})

		if (!teacher?.user) {
			return null
		}

		return this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.student', 'student')
			.leftJoinAndSelect('user.teacher', 'teacher')
			.addSelect('user.password')
			.where('user.id = :id', { id: teacher.user.id })
			.getOne()
	}

	async update(id: string, updateUserDto: UpdateUserDto = {}): Promise<User> {
		const user = await this.findOne(id)
		const nextRole = updateUserDto?.role ?? user.role

		user.email = updateUserDto?.email ?? user.email
		user.name = updateUserDto?.name ?? user.name
		user.department = updateUserDto?.department ?? user.department

		user.pfp = updateUserDto?.pfp ?? user.pfp
		user.role = nextRole

		await this.userRepository.save(user)
		await this.syncRoleProfile(user, nextRole, updateUserDto)

		return this.findOne(id)
	}

	async updateSelf(id: string, payload: UserSelfUpdatePayload): Promise<User> {
		const user = await this.findOne(id)

		user.email = payload.email ?? user.email
		user.name = payload.name ?? user.name
		user.department = payload.department ?? user.department

		await this.userRepository.save(user)
		return this.findOne(id)
	}

	async updateProfilePicture(id: string, pfpPath: string): Promise<User> {
		const result = await this.userRepository.update({ id }, { pfp: pfpPath })

		if (!result.affected) {
			throw new NotFoundException("User not found")
		}

		return this.findOne(id)
	}

	async enable(id: string): Promise<User> {
		return this.setActiveStatus(id, true)
	}

	async disable(id: string): Promise<User> {
		return this.setActiveStatus(id, false)
	}

	
	// HELPER

	private async setActiveStatus(id: string, isActive: boolean): Promise<User> {
		const user = await this.findOne(id)
		user.is_active = isActive
		await this.userRepository.save(user)

		return this.findOne(id)
	}

	private validateRolePayload(
		role: userRole,
		payload: CreateUserDto | UpdateUserDto
	): void {
		if (role === userRole.student && !payload.student) {
			throw new BadRequestException("Student payload is required for student role")
		}

		if (role === userRole.teacher && !payload.teacher) {
			throw new BadRequestException("Teacher payload is required for teacher role")
		}
	}

	private resolveCreatePassword(payload: CreateUserDto): string {
		if (payload.password?.trim()) {
			return payload.password.trim()
		}

		if (payload.role === userRole.student && payload.student?.nis) {
			return String(payload.student.nis)
		}

		if (payload.role === userRole.teacher && payload.teacher?.nip) {
			return String(payload.teacher.nip)
		}

		throw new BadRequestException(
			"Password is required for this role when NIS/NIP is unavailable"
		)
	}

	private async saveProfileForRole(
		userId: string,
		role: userRole,
		payload: CreateUserDto
	): Promise<void> {
		if (role === userRole.student && payload.student) {
			const student = this.studentRepository.create({
				user_id: userId,
				nis: payload.student.nis,
				class: payload.student.class,
			})

			await this.studentRepository.save(student)
			return
		}

		if (role === userRole.teacher && payload.teacher) {
			const teacher = this.teacherRepository.create({
				user_id: userId,
				nip: payload.teacher.nip,
			})

			await this.teacherRepository.save(teacher)
		}
	}

	private async findOneForCreateResponse(id: string, role: userRole): Promise<User> {
		if (role === userRole.student) {
			const user = await this.userRepository.findOne({
				where: { id },
				relations: {
					student: true,
				},
			})

			if (!user) {
				throw new NotFoundException("User not found")
			}

			return user
		}

		if (role === userRole.teacher) {
			const user = await this.userRepository.findOne({
				where: { id },
				relations: {
					teacher: true,
				},
			})

			if (!user) {
				throw new NotFoundException("User not found")
			}

			return user
		}

		return this.findOne(id)
	}

	private async syncRoleProfile(
		user: User,
		role: userRole,
		payload: UpdateUserDto
	): Promise<void> {
		if (role === userRole.student) {
			if (user.teacher) {
				await this.teacherRepository.delete({ user_id: user.id })
			}

			const existingStudent = await this.studentRepository.findOne({
				where: { user_id: user.id },
			})

			if (!existingStudent) {
				if (!payload.student) {
					throw new BadRequestException(
						"Student payload is required when changing role to student"
					)
				}

				await this.studentRepository.save(
					this.studentRepository.create({
						user_id: user.id,
						nis: payload.student.nis,
						class: payload.student.class,
					})
				)

				return
			}

			if (payload.student) {
				existingStudent.nis = payload.student.nis ?? existingStudent.nis
				existingStudent.class = payload.student.class ?? existingStudent.class
				await this.studentRepository.save(existingStudent)
			}

			return
		}

		if (role === userRole.admin) {
			if (user.student) {
				await this.studentRepository.delete({ user_id: user.id })
			}

			if (user.teacher) {
				await this.teacherRepository.delete({ user_id: user.id })
			}

			return
		}

		if (user.student) {
			await this.studentRepository.delete({ user_id: user.id })
		}

		const existingTeacher = await this.teacherRepository.findOne({
			where: { user_id: user.id },
		})

		if (!existingTeacher) {
			if (!payload.teacher) {
				throw new BadRequestException(
					"Teacher payload is required when changing role to teacher"
				)
			}

			await this.teacherRepository.save(
				this.teacherRepository.create({
					user_id: user.id,
					nip: payload.teacher.nip,
				})
			)

			return
		}

		if (payload.teacher) {
			existingTeacher.nip = payload.teacher.nip ?? existingTeacher.nip
			await this.teacherRepository.save(existingTeacher)
		}
	}
}
