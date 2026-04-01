import { Module } from "@nestjs/common"
import { AuthModule } from "./auth/auth.module"
import { AppService } from "./app.service"
import { AppController } from "./app.controller"
import dbConfig from "./config/typeorm.config"
import { UsersModule } from "./users/users.module"
import { MeModule } from "./me/me.module"

import { 
    ConfigModule, 
    ConfigService 
} from "@nestjs/config"

import { 
    TypeOrmModule, 
    TypeOrmModuleOptions 
} from "@nestjs/typeorm"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [dbConfig],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) =>
                configService.getOrThrow<TypeOrmModuleOptions>(
                    'typeorm',
                ),
        }),
        AuthModule,
        UsersModule,
		MeModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {}