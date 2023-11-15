import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AuthDto } from 'src/auth/dto';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@test.fr',
      password: 'test',
    };

    describe('Register', () => {
      it('should throw if email empty', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send(dto)
          .expect(403);
      });
    });
  });

  it('/ (GET)', () => {});
});
