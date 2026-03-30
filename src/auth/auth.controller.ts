import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginSiswaDTO } from './dto/login-siswa.dto';
import { LoginGuruDTO } from './dto/login-guru.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('loginSiswa')
  loginSiswa(@Body() dto: LoginSiswaDTO) {
    return this.authService.loginSiswa(dto);
  }

  @Post('loginGuru')
  loginGuru(@Body() dto: LoginGuruDTO) {
    return this.authService.loginGuru(dto);
  }

  @Post('refresh')
  refreshToken(@Body() dto: RefreshTokenDTO) {
    return this.authService.refreshToken(dto);
  }
}
