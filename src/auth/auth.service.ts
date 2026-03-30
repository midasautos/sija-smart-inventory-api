import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginSiswaDTO } from './dto/login-siswa.dto';
import { LoginGuruDTO } from './dto/login-guru.dto';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { json } from 'stream/consumers';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async loginSiswa(dto: LoginSiswaDTO) {
    const password = await bcrypt.hash('user123', 12);
    const user = {
      "email" : 'user@gmail.com',
      "nis": '12345',
      "password": password,
    };

    if (dto.email != null && dto.email !== user.email) {
      throw new UnauthorizedException("Maaf Email / NIS tidak sesuai");
    }
    if (dto.nis != null && dto.nis !== user.nis) {
      throw new UnauthorizedException("Maaf Email / NIS tidak sesuai");
    }

    const verified = await bcrypt.compare(dto.password, user.password);
    if (!verified) {
      throw new UnauthorizedException("Maaf Password tidak sesuai");
    }

    const payload = { sub: user.nis, email: user.email, role: 'siswa' };
    return {
      access_token: this.jwtService.sign(payload),
      user: { email: user.email, nis: user.nis },
    };
  }

  async loginGuru(dto: LoginGuruDTO) {
    const password = await bcrypt.hash('user123', 12);
    const user = {
      "email": 'user@gmail.com',
      "nip": '12345',
      "password": password,
    };

    if (dto.email != null && dto.email !== user.email) {
      throw new UnauthorizedException("Maaf Email / NIS tidak sesuai");
    }
    if (dto.nip != null && dto.nip !== user.nip) {
      throw new UnauthorizedException("Maaf Email / NIS tidak sesuai");
    }

    const verified = await bcrypt.compare(dto.password, user.password);
    if (!verified) {
      throw new UnauthorizedException("Maaf Password tidak sesuai");
    }

    const payload = { sub: user.nip, email: user.email, role: 'guru' };
    return {
      access_token: this.jwtService.sign(payload),
      user: { email: user.email, nip: user.nip },
    };
  }
}
