import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { LoginSiswaDTO } from './dto/login-siswa.dto';
import { LoginGuruDTO } from './dto/login-guru.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
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

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
