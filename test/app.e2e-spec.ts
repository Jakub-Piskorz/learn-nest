import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
  });
  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    describe('Sign in', () => {
      it.todo('Should sign in');
    });
    describe('Sign up', () => {
      it.todo('Should sign up');
    });
  });
  describe('Users', () => {
    describe('User me', () => {
      it.todo('Should check the user');
    });
    describe('Edit user', () => {
      it.todo('Should edit the user');
    });
  });
  describe('Bookmarks', () => {
    describe('Get bookmarks', () => {
      it.todo('Should get bookmarks');
    });
    describe('Get bookmark by ID', () => {
      it.todo('Should get bookmark by ID');
    });
    describe('Edit bookmark', () => {
      it.todo('Should edit bookmark');
    });
    describe('Delete bookmark', () => {
      it.todo('Should delete bookmark');
    });
  });
});
