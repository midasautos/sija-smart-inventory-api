import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginSiswaDTO } from './dto/login-siswa.dto';
import { LoginGuruDTO } from './dto/login-guru.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async loginSiswa(dto: LoginSiswaDTO) {
    const password = await bcrypt.hash('user123', 12);
    const user = {
      email: 'user@gmail.com',
      nis: '12345',
      password,
    };

    if (dto.email != null && dto.email !== user.email) {
      throw new UnauthorizedException('Maaf Email / NIS tidak sesuai');
    }
    if (dto.nis != null && dto.nis !== user.nis) {
      throw new UnauthorizedException('Maaf Email / NIS tidak sesuai');
    }

    const verified = await bcrypt.compare(dto.password, user.password);
    if (!verified) {
      throw new UnauthorizedException('Maaf Password tidak sesuai');
    }

    const payload = { sub: user.nis, email: user.email, role: 'siswa' };
    return this.buildTokenResponse(payload, { email: user.email, nis: user.nis });
  }

  async loginGuru(dto: LoginGuruDTO) {
    const password = await bcrypt.hash('user123', 12);
    const user = {
      email: 'user@gmail.com',
      nip: '12345',
      password,
    };

    if (dto.email != null && dto.email !== user.email) {
      throw new UnauthorizedException('Maaf Email / NIS tidak sesuai');
    }
    if (dto.nip != null && dto.nip !== user.nip) {
      throw new UnauthorizedException('Maaf Email / NIS tidak sesuai');
    }

    const verified = await bcrypt.compare(dto.password, user.password);
    if (!verified) {
      throw new UnauthorizedException('Maaf Password tidak sesuai');
    }

    const payload = { sub: user.nip, email: user.email, role: 'guru' };
    return this.buildTokenResponse(payload, { email: user.email, nip: user.nip });
  }

  async refreshToken(dto: RefreshTokenDTO) {
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const userPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return this.buildTokenResponse(userPayload, {
        email: payload.email,
        id: payload.sub,
      });
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }
  }

  private buildTokenResponse(payload: Record<string, any>, user: Record<string, any>) {
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '30m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user,
    };
  }
}
