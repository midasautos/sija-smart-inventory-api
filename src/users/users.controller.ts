import { UsersService } from "./users.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { diskStorage } from "multer"
import { extname, join } from "path"
import { FileInterceptor } from "@nestjs/platform-express"

import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	UploadedFile,
	UseInterceptors
} from "@nestjs/common"

const profilePictureStorage = diskStorage({
	destination: join(process.cwd(), "images", "pfp"),
	filename: (_, file, callback) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
		const extension = extname(file.originalname)
		callback(null, `${uniqueSuffix}${extension}`)
	},
})

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	// GET
	@Get()
	findAll() {
		return this.usersService.findAll()
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.usersService.findOne(id)
	}

	// POST

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto)
	}

	// PATCH

	@Patch(":id")
	@UseInterceptors(
		FileInterceptor("pfp", {
			storage: profilePictureStorage,
			fileFilter: (_, file, callback) => {
				if (!file.mimetype.startsWith("image/")) {
					return callback(new Error("Only image files are allowed"), false)
				}

				callback(null, true)
			},
		})
	)
	update(
		@Param("id") id: string,
		@Body() updateUserDto: UpdateUserDto,
		@UploadedFile() file?: Express.Multer.File
	) {
		if (file) {
			updateUserDto.pfp = `/images/pfp/${file.filename}`
		}

		return this.usersService.update(id, updateUserDto)
	}

	@Patch(":id/enable")
	enable(@Param("id") id: string) {
		return this.usersService.enable(id)
	}

	@Patch(":id/disable")
	disable(@Param("id") id: string) {
		return this.usersService.disable(id)
	}
}
