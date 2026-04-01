import { User } from "../users/entities/user.entities"
import { UpdateMeDto } from "./dto/update-me.dto"
import { UsersService } from "../users/users.service"

import {
	BadRequestException,
	Injectable,
} from "@nestjs/common"

@Injectable()
export class MeService {
	constructor(private readonly usersService: UsersService) {}

	async getMe(userId: string): Promise<User> {
		return this.usersService.findOne(userId)
	}

	async updateMe(userId: string, payload: UpdateMeDto): Promise<User> {
		return this.usersService.updateSelf(userId, payload)
	}

	async updateProfilePicture(
		userId: string,
		file: Express.Multer.File | undefined
	): Promise<User> {
		if (!file) {
			throw new BadRequestException("Profile picture file is required")
		}

		return this.usersService.updateProfilePicture(
			userId,
			`/images/pfp/${file.filename}`
		)
	}
}
