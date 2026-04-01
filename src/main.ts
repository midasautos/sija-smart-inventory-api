import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)

    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

    app.enableCors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    })

    app.useStaticAssets(join(process.cwd(), 'images', 'pfp'), {
        prefix: '/images/pfp/',
    })

    app.setGlobalPrefix('api')

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
