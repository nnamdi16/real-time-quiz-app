import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../api/user/user.controller';
import { UserService } from '../../api/user/user.service';
import { registerPayload, userData } from './stub/user.stub';
import { RegisterUserDto } from 'src/api/user/user.dto';
import { HttpStatus } from '@nestjs/common';

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
              .mockImplementation((payload: RegisterUserDto) =>
                Promise.resolve({
                  statusCode: HttpStatus.CREATED,
                  message: 'User Registration Successful',
                  status: 'success',
                  data: { ...payload, ...userData() },
                  error: null,
                }),
              ),
          },
        },
      ],
    }).compile();
    userController = module.get<UserController>(UserController);
  });

  describe('register() method should successfully save a user', () => {
    test('should save a user', async () => {
      const data = await userController.register({
        ...registerPayload(),
        email: 'Jane@example.com',
      });
      expect(data).toEqual({
        data: userData(),
        error: null,
        message: 'User Registration Successful',
        status: 'success',
        statusCode: 201,
      });
    });
  });
});
