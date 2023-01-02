import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

// type AuthService = any;

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  login(@Body() dto: AuthDto) {
    console.log({ dto });
    return this.authService.registerService(dto);
  }

  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.authService.loginService(dto);
  }
}
