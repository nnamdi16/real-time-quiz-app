import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { DatabaseModule } from '../../db/database.module';
import { clearDatabase } from '../migration/util';
import { registerPayload, loginPayload } from '../user/stub/user.stub';
import * as request from 'supertest';
import { quizPayload } from './stub/quiz.stub';

describe('Quiz Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const appModule = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();

    app = appModule.createNestApplication();
    await app.init();
    await clearDatabase(app);
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/v1/quizzes create quiz (POST)', () => {
    it('it should createa quiz successfully', async () => {
      await request(app.getHttpServer())
        .post('/v1/users/register')
        .send(registerPayload);
      const loginResponse = await request(app.getHttpServer())
        .post('/v1/users/login')
        .send(loginPayload);

      const {
        data: { accessToken },
      } = loginResponse.body;
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
});
