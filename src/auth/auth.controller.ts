import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup() {
    return "I'm signing up!";
  }
  @Post('signin')
  login() {
    return "I'm signing in!";
  }
}
