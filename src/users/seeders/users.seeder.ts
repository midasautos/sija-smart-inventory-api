import * as bcrypt from "bcrypt"
import { Repository } from "typeorm"
import { User } from "../entities/user.entities"
import { userRole } from "../enums/role.enum"
import { InjectRepository } from "@nestjs/typeorm"

import {
	Injectable,
	Logger,
	OnApplicationBootstrap,
} from "@nestjs/common"

@Injectable()
export class UsersSeeder implements OnApplicationBootstrap {
	private readonly logger = new Logger(UsersSeeder.name)

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	async onApplicationBootstrap(): Promise<void> {
		const totalUsers = await this.userRepository.count()

		if (totalUsers > 0) {
			return
		}

		const adminEmail = "admin@smartinventory.local"
		const adminName = "Super Admin"
		const adminPassword = "admin12345"
		const adminDepartment = "IT"

		const hashedPassword = await bcrypt.hash(adminPassword, 10)

		const admin = this.userRepository.create({
			email: adminEmail,
			name: adminName,
			role: userRole.admin,
			department: adminDepartment,
			password: hashedPassword,
			is_active: true,
		})

		await this.userRepository.save(admin)
		this.logger.log(`Seeded default admin user: ${adminEmail}`)
	}
}
