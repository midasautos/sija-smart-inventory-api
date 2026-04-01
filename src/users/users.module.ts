import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"
import { UsersSeeder } from "./seeders/users.seeder"
import { User } from "./entities/user.entities"
import { Student } from "./entities/student.entities"
import { Teacher } from "./entities/teacher.entities"

@Module({
	imports: [TypeOrmModule.forFeature([User, Student, Teacher])],
	controllers: [UsersController],
	providers: [UsersService, UsersSeeder],
	exports: [UsersService],
})
export class UsersModule {}
