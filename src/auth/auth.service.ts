import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async registerService(dto: AuthDto) {
    try {
      const hash = await argon.hash(dto.password);
      const user =
        await this.prismaService.user.create({
          data: {
            email: dto.email,
            hash,
          },
        });

      return this.signJwtToken(
        user.id,
        user.email,
      );
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

  async loginService(dto: AuthDto) {
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
    return this.signJwtToken(user.id, user.email);
  }
  async signJwtToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '20m',
        secret: this.config.get('JWT_SECRET'),
      },
    );
    return {
      access_token: token,
    };
  }
}
