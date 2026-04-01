import { diskStorage } from "multer"
import { extname, join } from "path"
import { MeService } from "./me.service"
import { UpdateMeDto } from "./dto/update-me.dto"
import { FileInterceptor } from "@nestjs/platform-express"
import { CurrentUserId } from "./decorators/current-user-id.decorator"

import {
	Body,
	Controller,
	Get,
	Patch,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common"

const profilePictureStorage = diskStorage({
	destination: join(process.cwd(), "images", "pfp"),
	filename: (_, file, callback) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
		const extension = extname(file.originalname)
		callback(null, `${uniqueSuffix}${extension}`)
	},
})

@Controller("me")
export class MeController {
	constructor(private readonly meService: MeService) {}

	@Get()
	getMe(@CurrentUserId() userId: string) {
		return this.meService.getMe(userId)
	}

	@Patch()
	updateMe(@CurrentUserId() userId: string, @Body() payload: UpdateMeDto) {
		return this.meService.updateMe(userId, payload)
	}

	@Patch("pfp")
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
	updateProfilePicture(
		@CurrentUserId() userId: string,
		@UploadedFile() file?: Express.Multer.File
	) {
		return this.meService.updateProfilePicture(userId, file)
	}
}
