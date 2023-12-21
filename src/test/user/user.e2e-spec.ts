import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { registerPayload } from './stub/user.stub';
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
          console.log(response);
          console.log(response.body);

          expect(response.body.status).toBe('success');
          expect(response.body.statusCode).toEqual(HttpStatus.CREATED);
          expect(response.body.message).toBe('User Registration Successful');
        })
        .expect(HttpStatus.CREATED);
    });
  });
});
