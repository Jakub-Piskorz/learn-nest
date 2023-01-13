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
import {
  CreateBookmarkDto,
  EditBookmarkDto,
} from '../src/bookmark/dto';

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
    await app.listen(3334);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl(
      'http://localhost:3334',
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
          .expectStatus(200);
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
          .expectStatus(200);
      });
    });
  });
  describe('Bookmarks', () => {
    const createBookmarkDto: CreateBookmarkDto = {
      title: 'Original bookmark title',
      description:
        'Original bookmark description',
      link: 'https://google.com',
    };
    const editBookmarkDto: EditBookmarkDto = {
      description: 'Edited bookmark description',
      link: 'https://facebook.com',
    };
    describe('Get empty bookmarks', () => {
      it('Should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create new bookmark', () => {
      it('Should create new bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .stores('firstBookmarkId', 'id')
          .withBody({
            ...createBookmarkDto,
          })
          .expectStatus(201);
      });
    });
    describe('Get 1 bookmark', () => {
      it('Should get 1 bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('Create another bookmark', () => {
      it('Should create another bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .stores('secondBookmarkId', 'id')
          .withBody({
            ...createBookmarkDto,
          })
          .expectStatus(201);
      });
    });
    describe('Get 2 bookmarks', () => {
      it('Should get 2 bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(2);
      });
    });
    describe('Get bookmark by first ID', () => {
      it('Should get bookmark by first ID', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams(
            'id',
            '$S{firstBookmarkId}',
          )
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains(
            '$S{firstBookmarkId}',
          );
      });
    });
    describe('Get bookmark by second ID', () => {
      it('Should get bookmark by second ID', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams(
            'id',
            '$S{secondBookmarkId}',
          )
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains(
            '$S{secondBookmarkId}',
          );
      });
    });
    describe('Edit bookmark by ID', () => {
      it('Should edit bookmark by ID', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams(
            'id',
            '$S{firstBookmarkId}',
          )
          .withBody(editBookmarkDto)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains(
            editBookmarkDto.description,
          );
      });
    });
    describe('Delete bookmark by first ID', () => {
      it('Should delete bookmark by first ID', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams(
            'id',
            '$S{firstBookmarkId}',
          )
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });
    });
    describe('Delete bookmark by second ID', () => {
      it('Should delete bookmark by second ID', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams(
            'id',
            '$S{secondBookmarkId}',
          )
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });
    });
    describe('Return empty bookmarks', () => {
      it('Should return empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
