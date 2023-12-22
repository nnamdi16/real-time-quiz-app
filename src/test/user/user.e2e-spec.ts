import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { loginPayload, registerPayload } from './stub/user.stub';
import { DatabaseModule } from '../../db/database.module';
import { clearDatabase } from '../migration/util';

describe('UserController (e2e)', () => {
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
