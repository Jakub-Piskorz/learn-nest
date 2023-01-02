import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
  ) {}

  async loginService(dto: AuthDto) {
    try {
      const hash = await argon.hash(dto.password);
      const user =
        await this.prismaService.user.create({
          data: {
            email: dto.email,
            hash,
          },
        });

      delete user.hash;

      return user;
    } catch (e) {
      if (
        e instanceof PrismaClientKnownRequestError
      ) {
        if (e.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken',
          );
        }
      }
    }
  }

  async registerService(dto: AuthDto) {
    const user =
      await this.prismaService.user.findUnique({
        where: { email: dto.email },
      });
    if (!user) {
      throw new ForbiddenException(
        'Credentials incorrect',
      );
    }

    const passwordMatches = await argon.verify(
      user.hash,
      dto.password,
    );
    if (!passwordMatches) {
      throw new ForbiddenException(
        'Password incorrect',
      );
    }
    delete user.hash;
    return user;
  }
}
