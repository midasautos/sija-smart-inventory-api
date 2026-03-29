import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginSiswaDTO } from './dto/login-siswa.dto';
import { LoginGuruDTO } from './dto/login-guru.dto';
import * as bcrypt from "bcrypt"
import { json } from 'stream/consumers';

@Injectable()
export class AuthService {
  constructor() {}

  async loginSiswa(dto : LoginSiswaDTO) {
    const password = bcrypt.hash("user123", 12)
    const user = {
        "email" : "user@gmail.com",
        "nis" : "12345",
        "password" : password
    }
    if(dto.email != null && dto.email != user.email){
      throw new UnauthorizedException("Maaf Email / NIS tidak sesuai")
    }
    if(dto.nis != null && dto.nis != user.nis){
      throw new UnauthorizedException("Maaf Email / NIS tidak sesuai")
    }
    const verified = bcrypt.compare(dto.password, user.password)

    return user
  }

  async loginGuru(dto : LoginGuruDTO) {
    const password = bcrypt.hash("user123", 12)
    const user = {
        "email" : "user@gmail.com",
        "nip" : "12345",
        "password" : password
    }
    if(dto.email != null && dto.email != user.email){
      throw new UnauthorizedException("Maaf Email / NIS tidak sesuai")
    }
    if(dto.nip != null && dto.nip != user.nip){
      throw new UnauthorizedException("Maaf Email / NIS tidak sesuai")
    }
    const verified = bcrypt.compare(dto.password, user.password)

    return user
  }
}
