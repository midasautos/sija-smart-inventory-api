import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginSiswaDTO } from './dto/login-siswa.dto';
import { LoginGuruDTO } from './dto/login-guru.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { userRole } from '../users/enums/role.enum';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entities';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async loginSiswa(dto: LoginSiswaDTO) {
    if (!dto.email && !dto.nis) {
      throw new UnauthorizedException('Email atau NIS harus diisi');
    }

    let user: User | null = null;
    if (dto.email) {
      user = await this.usersService.findByEmailWithPassword(dto.email.trim());
    }

    if (!user && dto.nis) {
      user = await this.usersService.findStudentByNis(dto.nis);
    }

    if (!user || user.role !== userRole.student) {
      throw new UnauthorizedException('Maaf Email / NIS tidak sesuai');
    }

    const verified = await bcrypt.compare(dto.password, user.password);
    if (!verified) {
      throw new UnauthorizedException('Maaf Password tidak sesuai');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.buildTokenResponse(payload, {
      id: user.id,
      email: user.email,
      role: user.role,
      student: user.student,
      access: this.getAccessRights(user.role),
    });
  }

  async loginGuru(dto: LoginGuruDTO) {
    if (!dto.email && !dto.nip) {
      throw new UnauthorizedException('Email atau NIP harus diisi');
    }

    let user: User | null = null;
    if (dto.email) {
      user = await this.usersService.findByEmailWithPassword(dto.email.trim());
    }

    if (!user && dto.nip) {
      user = await this.usersService.findTeacherByNip(dto.nip);
    }

    if (!user || user.role !== userRole.teacher) {
      throw new UnauthorizedException('Maaf Email / NIP tidak sesuai');
    }

    const verified = await bcrypt.compare(dto.password, user.password);
    if (!verified) {
      throw new UnauthorizedException('Maaf Password tidak sesuai');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.buildTokenResponse(payload, {
      id: user.id,
      email: user.email,
      role: user.role,
      teacher: user.teacher,
      access: this.getAccessRights(user.role),
    });
  }

  async refreshToken(dto: RefreshTokenDTO) {
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.usersService.findOne(payload.sub)
      const userPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return this.buildTokenResponse(userPayload, {
        id: user.id,
        email: user.email,
        role: user.role,
        student: user.student,
        teacher: user.teacher,
        access: this.getAccessRights(user.role),
      });
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }
  }

  private getAccessRights(role: string) {
    switch (role) {
      case userRole.teacher:
        return ['all'];
      case userRole.student:
        return [
          'itemBorrowRequest',
          'history',
          'itemQuantity',
          'status',
        ];
      default:
        return [];
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
