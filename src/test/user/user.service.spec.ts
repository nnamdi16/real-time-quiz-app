import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../api/user/user.service';
import { registerPayload, userData } from './stub/user.stub';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../api/user/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<UserEntity>;
  let configService: ConfigService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        ConfigService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register a new user', () => {
    describe('register() method should throw error', () => {
      test('should throw error if a user exists', async () => {
        try {
          jest
            .spyOn(userRepository, 'exist')
            .mockImplementation(() => Promise.resolve(true));
          await userService.registerUser(registerPayload());
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('Email or username already exists');
          expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      });
      test('should throw error an internal server error when an error occurs from the db', async () => {
        try {
          jest
            .spyOn(userRepository, 'exist')
            .mockImplementation(() => Promise.reject(new Error()));
          await userService.registerUser(registerPayload());
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
    });
    describe('register() method should successfully save a user', () => {
      test('should save a user', async () => {
        const mockedPassword =
          '$2b$10$1is2GJ2qPDxtD4trQTnZ2eFwhs47Jg27OWVHkOZIesKmO8PO41hXS';

        jest
          .spyOn(userRepository, 'exist')
          .mockImplementation(() => Promise.resolve(false));
        jest
          .spyOn(userRepository, 'save')
          .mockImplementation(() => Promise.resolve(userData()));
        jest
          .spyOn(configService, 'get')
          .mockImplementation(() => Promise.resolve('10'));
        jest
          .spyOn(bcrypt, 'hash')
          .mockImplementation(() => Promise.resolve(mockedPassword));
        const data = await userService.registerUser(registerPayload());
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
});
