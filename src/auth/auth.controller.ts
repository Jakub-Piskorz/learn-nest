import {
  Controller,
  Post,
  Body,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @HttpCode(201)
  @Post('signup')
  login(@Body() dto: AuthDto) {
    return this.authService.registerService(dto);
  }

  @HttpCode(200)
  @Post('signin')
  register(@Body() dto: AuthDto) {
    return this.authService.loginService(dto);
  }
}
