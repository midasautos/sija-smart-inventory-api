import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { config } from 'dotenv';

const envResult = config();
if (envResult.error) {
  throw envResult.error;
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in .env');
}

@Module({
  imports: [
    JwtModule.register({
      // global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
