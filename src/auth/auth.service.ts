import { Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  loginservice() {
    return { msg: 'json login service' };
  }

  registerservice() {
    return 'register service';
  }
}
