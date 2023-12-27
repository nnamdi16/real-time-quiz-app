import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { registerPayload, loginPayload } from '../user/stub/user.stub';
import * as request from 'supertest';
import { quizPayload } from './stub/quiz.stub';
import { TestDbModule } from '../db/test-db.module';
import { QuizModule } from '../../api/quiz/module/quiz.module';
import { UserModule } from '../../api/user/module/user.module';
import { RefreshTokenStrategy } from '../../api/auth/refreshToken.strategy';
import { AccessTokenStrategy } from '../../api/auth/accessToken.strategy';
import { WebsocketGateway } from '../../api/quiz/quiz.gateway';

describe('Quiz Controller (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const appModule = await Test.createTestingModule({
      imports: [TestDbModule, QuizModule, UserModule],
      controllers: [],
      providers: [RefreshTokenStrategy, AccessTokenStrategy, WebsocketGateway],
    }).compile();

    app = appModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/v1/quizzes create quiz (POST)', () => {
    it('it should createa quiz successfully', async () => {
      await request(app.getHttpServer())
        .post('/v1/users/register')
        .send(registerPayload);
      const loginResponse = await request(app.getHttpServer())
        .post('/v1/users/login')
        .send(loginPayload);
      accessToken = loginResponse.body.data.accessToken;
      return request(app.getHttpServer())
        .post('/v1/quizzes')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(quizPayload)
        .expect((response) => {
          expect(response.body.status).toBe('success');
          expect(response.body.statusCode).toEqual(HttpStatus.CREATED);
          expect(response.body.message).toBe('Quiz created successfully');
          expect(typeof response.body.data).toBe('string');
        })
        .expect(HttpStatus.CREATED);
    });
  });

  describe('/v1/quizzes fetch all quizzes (GET)', () => {
    it('Endpoint to fetch all quizzes', async () => {
      return request(app.getHttpServer())
        .get('/v1/quizzes')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, limit: 10 })
        .expect((response) => {
          expect(response.body.status).toBe('success');
          expect(response.body.statusCode).toEqual(HttpStatus.OK);
          expect(response.body.message).toBe('Quiz fetched successfully');
          expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        })
        .expect(HttpStatus.OK);
    });
  });
});
