import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../api/user/user.controller';
import { UserService } from '../../api/user/user.service';
import {
  loginPayload,
  loginResponse,
  registerPayload,
  signUpResponse,
} from './stub/quiz.stub';

describe('User controller', () => {
  let userController: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            registerUser: jest
              .fn()
              .mockImplementation(() => Promise.resolve(signUpResponse)),
            login: jest
              .fn()
              .mockImplementation(() => Promise.resolve(loginResponse)),
          },
        },
      ],
    }).compile();
    userController = module.get<UserController>(UserController);
  });

  describe('register() method should successfully save a user', () => {
    test('should save a user', async () => {
      const data = await userController.register({
        ...registerPayload,
        email: 'Jane@example.com',
      });
      expect(data).toEqual(signUpResponse);
    });
  });
  describe('login() method should successfully authenticate a user', () => {
    test('authenticate a user', async () => {
      const data = await userController.login(loginPayload);
      expect(data).toEqual(loginResponse);
    });
  });
});
