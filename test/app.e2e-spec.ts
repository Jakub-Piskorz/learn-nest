import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';

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
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl(
      'http://localhost:3333',
    );
  });
  afterAll(async () => {
    await app.close();
  });

  const dto: AuthDto = {
    email: 'test@email.com',
    password: '123',
  };
  describe('Auth', () => {
    describe('Sign up', () => {
      it('should throw error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('should throw error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('should throw error if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);
      });
      it('should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Sign in', () => {
      it('should throw error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('should throw error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('should throw error if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400);
      });
      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });
  describe('Users', () => {
    describe('User me', () => {
      it('should get the user information', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      const editUserDto: EditUserDto = {
        firstName: 'Kuba',
        email: 'changed@email.com',
      };
      it("Should edit the user's email", () => {
        return pactum
          .spec()
          .patch('/users')
          .withBody(editUserDto)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .inspect();
      });
      it('Should fail to edit user with no body provided', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(400);
      });
      it('Should fail login on old email', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(403);
      });
      it('Should login with new email', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            ...dto,
            email: 'changed@email.com',
          })
          .expectStatus(200)
          .inspect();
      });
    });
  });
  describe('Bookmarks', () => {
    describe('Get bookmarks', () => {
      it.todo('Should get bookmarks');
    });
    describe('Get bookmark by ID', () => {
      it.todo('Should get bookmark by ID');
    });
    describe('Edit bookmark by ID', () => {
      it.todo('Should edit bookmark by ID');
    });
    describe('Delete bookmark by ID', () => {
      it.todo('Should delete bookmark by ID');
    });
  });
});
