import { registerAs } from "@nestjs/config"
import { config as dotnenvConfig } from "dotenv"
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { DataSource, DataSourceOptions } from 'typeorm'

dotnenvConfig()

export const dbConfig: DataSourceOptions & TypeOrmModuleOptions = {
    type: "mysql",
	host: process.env.DB_HOST ?? "localhost",
	port: Number(process.env.DB_PORT ?? 3306),
	username: process.env.DB_USERNAME ?? "root",
	password: process.env.DB_PASSWORD ?? "",
	database: process.env.DB_NAME ?? "brin_db",
	entities: [
		`${__dirname}/../**/*.entity{.ts,.js}`,
		`${__dirname}/../**/*.entities{.ts,.js}`
	],
	synchronize: true,
	logging: false,
	extra: {
		connectionLimit: 40
	}
}

export default registerAs('typeorm', () => dbConfig)
export const dbSource = new DataSource(dbConfig)