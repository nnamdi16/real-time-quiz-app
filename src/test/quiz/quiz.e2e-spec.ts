import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { registerPayload, userData } from './stub/quiz.stub';
import { IResponse } from '../../util/util';
import { User } from '../../api/user/user.entity';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  describe('/auth/register (POST)', () => {
    it('it should register a user and return the new user object', () => {
      return request(app.getHttpServer())
        .post('/v1/users/register')
        .set('Accept', 'application/json')
        .send(registerPayload())
        .expect((response: IResponse<User>) => {
          const { id, username, email } = response.data;

          expect(typeof id).toBe('number');
          expect(username).toEqual(userData().username);
          expect(email).toEqual(userData().email);
          // expect(password).toBeUndefined();
        })
        .expect(HttpStatus.CREATED);
    });
  });
});
