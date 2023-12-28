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
import { Quiz } from '../../api/quiz/entity/quiz.entity';

describe('Quiz Controller (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let quizzes: Quiz[];
  let quiz: Quiz;

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
          expect(response.body.status).toEqual('success');
          expect(response.body.statusCode).toEqual(HttpStatus.CREATED);
          expect(response.body.message).toEqual('Quiz created successfully');
          expect(typeof response.body.data).toEqual('string');
        })
        .expect(HttpStatus.CREATED);
    });
  });

  describe('/v1/quizzes fetch all quizzes (GET)', () => {
    it('should fetch all quizzes', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/quizzes')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, limit: 10 });
      quizzes = response.body.data;

      expect(response.body.status).toEqual('success');
      expect(response.body.statusCode).toEqual(HttpStatus.OK);
      expect(response.body.message).toEqual('Quiz fetched successfully');
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('/v1/quizzes/:id fetches a particular quiz (GET)', () => {
    it('should fetch a particular quiz', async () => {
      const [quizDetail] = quizzes;

      const response = await request(app.getHttpServer())
        .get(`/v1/quizzes/${quizDetail.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`);
      quiz = response.body.data;
      expect(response.body.status).toEqual('success');
      expect(response.body.statusCode).toEqual(HttpStatus.OK);
      expect(response.body.message).toEqual('Quiz fetched successfully');
      expect(response.body.data.id).toEqual(quiz.id);
      expect(response.body.data.questions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('/v1/quizzes/:id/answer  submit answers to a quiz (POST)', () => {
    it('Should submit answers to a quiz', async () => {
      const [question] = quiz.questions;
      const {
        options: [option],
      } = question;
      return request(app.getHttpServer())
        .post(`/v1/quizzes/${question.id}/answer`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ options: [option.id] })
        .expect((response) => {
          expect(response.body.status).toEqual('success');
          expect(response.body.statusCode).toEqual(HttpStatus.OK);
          expect(response.body.message).toEqual(
            'The provided answer is correct',
          );
        })
        .expect(HttpStatus.CREATED);
    });
  });

  describe('/v1/quizzes/:id/participate participate in a quiz (POST)', () => {
    it('should a user participate in a quiz', async () => {
      const [quizDetail] = quizzes;
      return request(app.getHttpServer())
        .post(`/v1/quizzes/${quizDetail.id}/participate`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)

        .expect((response) => {
          expect(response.body.status).toEqual('success');
          expect(response.body.statusCode).toEqual(HttpStatus.OK);
          expect(response.body.message).toEqual(
            'Successfully joined Math Quiz quiz',
          );
        })
        .expect(HttpStatus.CREATED);
    });
  });

  describe("/v1/quizzes/:id/score fetches user's score for a particular quiz (GET)", () => {
    it('should fetch a particular quiz', async () => {
      const [quizDetail] = quizzes;

      return request(app.getHttpServer())
        .get(`/v1/quizzes/${quizDetail.id}/score`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect((response) => {
          expect(response.body.status).toEqual('success');
          expect(response.body.statusCode).toEqual(HttpStatus.OK);
          expect(response.body.message).toEqual(
            'User score retrieved successfully',
          );
          expect(response.body.data).toMatchObject({ score: 1 });
        })
        .expect(HttpStatus.OK);
    });
  });
});
