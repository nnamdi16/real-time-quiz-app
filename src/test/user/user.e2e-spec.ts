import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { loginPayload, registerPayload } from './stub/user.stub';
import { TestDbModule } from '../db/test-db.module';
import { QuizModule } from '../../api/quiz/module/quiz.module';
import { UserModule } from '../../api/user/module/user.module';
import { AccessTokenStrategy } from '../../api/auth/accessToken.strategy';
import { RefreshTokenStrategy } from '../../api/auth/refreshToken.strategy';
import { NatsModule } from '../../api/nats/nats.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const appModule = await Test.createTestingModule({
      imports: [TestDbModule, QuizModule, UserModule, NatsModule],
      controllers: [],
      providers: [RefreshTokenStrategy, AccessTokenStrategy],
    }).compile();

    app = appModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('it should register a user successfully', () => {
      return request(app.getHttpServer())
        .post('/v1/users/register')
        .set('Accept', 'application/json')
        .send(registerPayload)
        .expect((response) => {
          expect(response.body.status).toBe('success');
          expect(response.body.statusCode).toEqual(HttpStatus.CREATED);
          expect(response.body.message).toBe('User Registration Successful');
        })
        .expect(HttpStatus.CREATED);
    });
  });

  describe('/auth/login (POST)', () => {
    it('it should login a user successfully', () => {
      return request(app.getHttpServer())
        .post('/v1/users/login')
        .set('Accept', 'application/json')
        .send(loginPayload)
        .expect((response) => {
          expect(response.body.status).toBe('success');
          expect(response.body.statusCode).toEqual(HttpStatus.OK);
          expect(response.body.message).toBe('Authentication successful');
          expect(Object.keys(response.body.data)).toEqual([
            'accessToken',
            'refreshToken',
          ]);
        })
        .expect(HttpStatus.CREATED);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('it should generate token for a user successfully', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/v1/users/login')
        .send(loginPayload);

      const {
        data: { refreshToken },
      } = loginResponse.body;
      return request(app.getHttpServer())
        .post('/v1/users/refresh')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect((response) => {
          expect(response.body.status).toBe('success');
          expect(response.body.statusCode).toEqual(HttpStatus.OK);
          expect(response.body.message).toBe('Authentication successful');
          expect(Object.keys(response.body.data)).toEqual([
            'accessToken',
            'refreshToken',
          ]);
        })
        .expect(HttpStatus.CREATED);
    });
  });
});
