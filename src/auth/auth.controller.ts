import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  login(@Body() dto: AuthDto) {
    console.log({ dto });
    return this.authService.registerService(dto);
  }

  @Post('signin')
  register(@Body() dto: AuthDto) {
    return this.authService.loginService(dto);
  }
}
