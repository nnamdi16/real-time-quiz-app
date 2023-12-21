import { HttpStatus } from '@nestjs/common';
import { LoginDto, RegisterUserDto, TokenData } from 'src/api/user/dto/user.dto';
import { User } from 'src/api/user/entity/user.entity';
import { IResponse } from 'src/util/util';

export const registerPayload: RegisterUserDto = {
  email: 'jane@example.com',
  password: 'haJhsjk@#4jaiijsk',
  username: 'John#1234',
};

export const userData: any = {
  email: 'jane@example.com',
  password: '$2b$10$1is2GJ2qPDxtD4trQTnZ2eFwhs47Jg27OWVHkOZIesKmO8PO41hXS',
  username: 'John#1234',
  createdBy: null,
  updatedBy: null,
  id: '3100fccc-c3ff-49eb-8f46-fdb6deca3c72',
  createdDate: '2023-12-15T07:16:44.279Z',
  updatedDate: '2023-12-15T07:16:44.279Z',
};

export const loginPayload: LoginDto = {
  password: 'haJhsjk@#4jaiijsk',
  username: 'John#1234',
};

export const tokenData: TokenData = {
  id: '3100fccc-c3ff-49eb-8f46-fdb6deca3c72',
  username: 'John#1234',
  email: 'jane@example.com',
};
export const tokens: {
  accessToken: string;
  refreshToken: string;
} = {
  accessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyZDc2NjBhLWVhNDktNDhlNS05MTQ5LWI4MTNlOTI4ZDQ5YiIsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiSm9obiMxMjMiLCJpYXQiOjE3MDI2OTk2ODQsImV4cCI6MTcwMjcwMzI4NH0.bLmIUt_jSLRM-bEjpSdTzqKHUTSACDjSjnLmxIMaNTg',
  refreshToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyZDc2NjBhLWVhNDktNDhlNS05MTQ5LWI4MTNlOTI4ZDQ5YiIsImVtYWlsIjoiam9obmRvZUBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiSm9obiMxMjMiLCJpYXQiOjE3MDI2OTk2ODQsImV4cCI6MTcwMzMwNDQ4NH0.UvGGKJxI8oErJ-0fDmKk9ixk55E8q5v1k1LJjk7gklQ',
};

export const signUpResponse: IResponse<User> = {
  statusCode: HttpStatus.CREATED,
  message: 'User Registration Successful',
  status: 'success',
  data: userData,
  error: null,
};

export const loginResponse: IResponse<any> = {
  statusCode: HttpStatus.OK,
  message: 'Authentication successful',
  status: 'success',
  data: tokens,
  error: null,
};
