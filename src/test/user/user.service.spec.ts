import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../api/user/user.service';
import {
  registerPayload,
  userData,
  loginPayload,
  tokens,
  tokenData,
} from './stub/user.stub';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../api/user/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import EncryptService from '../../util/encryption';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let configService: ConfigService;
  let jwtService: JwtService;
  let encryptionService: EncryptService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        ConfigService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        JwtService,
        EncryptService,
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
    encryptionService = module.get<EncryptService>(EncryptService);
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
          await userService.registerUser(registerPayload);
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
          await userService.registerUser(registerPayload);
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
          .mockImplementation(() => Promise.resolve(userData));
        jest
          .spyOn(configService, 'get')
          .mockImplementation(() => Promise.resolve('10'));
        jest
          .spyOn(bcrypt, 'hash')
          .mockImplementation(() => Promise.resolve(mockedPassword));
        const data = await userService.registerUser(registerPayload);
        expect(data).toEqual({
          data: null,
          error: null,
          message: 'User Registration Successful',
          status: 'success',
          statusCode: 201,
        });
      });
    });
  });
  describe('login user', () => {
    describe('login() method should throw error', () => {
      test('should throw error for username not found', async () => {
        try {
          jest
            .spyOn(userRepository, 'findOne')
            .mockImplementation(() => Promise.resolve(null));
          await userService.login(loginPayload);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('Login failed');
          expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        }
      });
      test('should throw error for wrong password', async () => {
        try {
          jest
            .spyOn(userRepository, 'findOne')
            .mockImplementation(() => Promise.resolve(userData));
          jest
            .spyOn(bcrypt, 'compare')
            .mockImplementation(() => Promise.resolve(false));
          await userService.login(loginPayload);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('Invalid login');
          expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        }
      });
    });
    describe('login() method should successfully log in a user', () => {
      test('should save a user', async () => {
        const encyption =
          'b89f6aa96025d0946a95f9961c43be24_16095195effd5448d39d5dc4b65a96f3d7710b0b4c4165369b62ba6543e91d44aeeb8dd02376efa9a7d0450d2ed6be833a44542ec139fa2093e7b08c393cbd2695c2e6b9a4cc8c410996bf1b3d512d17aa7dc4c0c655df8bfbad70bbab292cede4c7acfdaa346768e05051cb272acfabb6dcf6acd3a177949e7c28d9aebf5e585c17a7bf8917d01540530c404b21a53e8f2b87056d4e51ccba0c5ce3294400d5b6952162dfd6dea1217533262ae172849b1206124db51b1ebcbdb73e168325bbb944662ba277e5864f0a4a24c8af7e09744e60279c4bc0753ad4547504ad92906058cb2b696fcf4885cbad5302937ab908580a9259df90136ab038f49834825f_d5be88e518f1d539e5ea6cae4d8e053e';

        jest
          .spyOn(userRepository, 'findOne')
          .mockImplementation(() => Promise.resolve(userData));
        jest
          .spyOn(userRepository, 'update')
          .mockImplementation(() =>
            Promise.resolve({} as unknown as UpdateResult),
          );
        jest
          .spyOn(bcrypt, 'compare')
          .mockImplementation(() => Promise.resolve(true));
        jest
          .spyOn(userService, 'getTokens')
          .mockImplementation(() => Promise.resolve(tokens));
        jest
          .spyOn(encryptionService, 'encrypt')
          .mockImplementation(() => Promise.resolve(encyption));
        const data = await userService.login(loginPayload);
        expect(data).toEqual({
          status: 'success',
          statusCode: 200,
          message: 'Authentication successful',
          data: tokens,
          error: null,
        });
      });
    });
  });
  describe('refresh token', () => {
    describe('refreshToken() method should throw error', () => {
      test('should throw error if user details is not found', async () => {
        try {
          jest
            .spyOn(userRepository, 'findOne')
            .mockImplementation(() => Promise.resolve(null));
          await userService.refreshToken({
            ...tokenData,
            refreshToken: tokens.refreshToken,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('Access Denied');
          expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        }
      });
      test('should throw error if the decrypted token is not the same as refresh token', async () => {
        try {
          jest
            .spyOn(userRepository, 'findOne')
            .mockImplementation(() => Promise.resolve(userData));
          jest
            .spyOn(encryptionService, 'decrypt')
            .mockImplementation(() => Promise.resolve(tokens.accessToken));
          await userService.refreshToken({
            ...tokenData,
            refreshToken: tokens.refreshToken,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('Access Denied');
          expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        }
      });
    });
    describe('refresh() should generate a fresh access token and refresh token', () => {
      test('should generate a new access token and refresh token', async () => {
        const encyption =
          'b89f6aa96025d0946a95f9961c43be24_16095195effd5448d39d5dc4b65a96f3d7710b0b4c4165369b62ba6543e91d44aeeb8dd02376efa9a7d0450d2ed6be833a44542ec139fa2093e7b08c393cbd2695c2e6b9a4cc8c410996bf1b3d512d17aa7dc4c0c655df8bfbad70bbab292cede4c7acfdaa346768e05051cb272acfabb6dcf6acd3a177949e7c28d9aebf5e585c17a7bf8917d01540530c404b21a53e8f2b87056d4e51ccba0c5ce3294400d5b6952162dfd6dea1217533262ae172849b1206124db51b1ebcbdb73e168325bbb944662ba277e5864f0a4a24c8af7e09744e60279c4bc0753ad4547504ad92906058cb2b696fcf4885cbad5302937ab908580a9259df90136ab038f49834825f_d5be88e518f1d539e5ea6cae4d8e053e';

        jest
          .spyOn(userRepository, 'findOne')
          .mockImplementation(() =>
            Promise.resolve({ ...userData, refreshToken: tokens.refreshToken }),
          );
        jest
          .spyOn(userRepository, 'update')
          .mockImplementation(() =>
            Promise.resolve({} as unknown as UpdateResult),
          );
        jest
          .spyOn(encryptionService, 'decrypt')
          .mockImplementation(() => Promise.resolve(tokens.refreshToken));
        jest
          .spyOn(userService, 'getTokens')
          .mockImplementation(() => Promise.resolve(tokens));
        jest
          .spyOn(encryptionService, 'encrypt')
          .mockImplementation(() => Promise.resolve(encyption));
        const data = await userService.refreshToken({
          ...tokenData,
          refreshToken: tokens.refreshToken,
        });
        expect(data).toEqual({
          status: 'success',
          statusCode: 200,
          message: 'Authentication successful',
          data: {
            accessToken:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyZDc2NjBhLWVhNDktNDhlNS05MTQ5LWI4MTNlOTI4ZDQ5YiIsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiSm9obiMxMjMiLCJpYXQiOjE3MDI2OTk2ODQsImV4cCI6MTcwMjcwMzI4NH0.bLmIUt_jSLRM-bEjpSdTzqKHUTSACDjSjnLmxIMaNTg',
            refreshToken:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyZDc2NjBhLWVhNDktNDhlNS05MTQ5LWI4MTNlOTI4ZDQ5YiIsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiSm9obiMxMjMiLCJpYXQiOjE3MDI2OTk2ODQsImV4cCI6MTcwMzMwNDQ4NH0.UvGGKJxI8oErJ-0fDmKk9ixk55E8q5v1k1LJjk7gklQ',
          },
          error: null,
        });
      });
    });
  });
  describe('Get tokens', () => {
    describe('getTokens() should return accessToken and refreshToken', () => {
      test('should return tokens', async () => {
        const tokenObj = {
          accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyZDc2NjBhLWVhNDktNDhlNS05MTQ5LWI4MTNlOTI4ZDQ5YiIsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiSm9obiMxMjMiLCJpYXQiOjE3MDI2OTk2ODQsImV4cCI6MTcwMjcwMzI4NH0.bLmIUt_jSLRM-bEjpSdTzqKHUTSACDjSjnLmxIMaNTg',
          refreshToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyZDc2NjBhLWVhNDktNDhlNS05MTQ5LWI4MTNlOTI4ZDQ5YiIsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiSm9obiMxMjMiLCJpYXQiOjE3MDI2OTk2ODQsImV4cCI6MTcwMzMwNDQ4NH0.UvGGKJxI8oErJ-0fDmKk9ixk55E8q5v1k1LJjk7gklQ',
        };
        jest
          .spyOn(jwtService, 'signAsync')
          .mockImplementationOnce(() => Promise.resolve(tokenObj.accessToken))
          .mockImplementationOnce(() => Promise.resolve(tokenObj.refreshToken));

        jest
          .spyOn(configService, 'get')
          .mockReturnValueOnce('accessTokenSecret')
          .mockReturnValueOnce('1h')
          .mockReturnValueOnce('refreshTokenSecret')
          .mockReturnValueOnce('7d');
        const data = await userService.getTokens(tokenData);
        expect(data.accessToken).toBe(tokenObj.accessToken);
        expect(data.refreshToken).toBe(tokenObj.refreshToken);
        expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
        expect(jwtService.signAsync).toHaveBeenCalledWith(tokenData, {
          secret: 'accessTokenSecret',
          expiresIn: '1h',
        });

        expect(jwtService.signAsync).toHaveBeenCalledWith(tokenData, {
          secret: 'refreshTokenSecret',
          expiresIn: '7d',
        });
      });
    });
  });
  describe('Find User By Id', () => {
    describe('findUserById() should return a user details', () => {
      test('should return user details', async () => {
        jest
          .spyOn(userRepository, 'findOne')
          .mockImplementationOnce(() => Promise.resolve(userData));

        jest
          .spyOn(configService, 'get')
          .mockReturnValueOnce('accessTokenSecret')
          .mockReturnValueOnce('1h')
          .mockReturnValueOnce('refreshTokenSecret')
          .mockReturnValueOnce('7d');
        const data = await userService.findUserById(tokenData.id);
        expect(data).toEqual(userData);
      });
    });
  });
});
