import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TokenData } from 'src/api/user/dto/user.dto';
import { tokenData } from '../user/stub/user.stub';
import { RefreshTokenStrategy } from '../../api/auth/refreshToken.strategy';

jest.mock('@nestjs/config');

describe('JwtStrategy', () => {
  let strategy: RefreshTokenStrategy;

  beforeEach(async () => {
    (ConfigService as jest.Mock).mockImplementation(() => ({
      get: jest.fn().mockReturnValue('test-secret-key'), // Replace 'test-secret-key' with your mock secret key
    }));

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [RefreshTokenStrategy, ConfigService],
    }).compile();

    strategy = module.get<RefreshTokenStrategy>(RefreshTokenStrategy);
  });

  test('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  test('should validate with mock request', async () => {
    const mockRequest: any = {
      get: jest.fn(() => 'Bearer mock-refresh-token'),
    };

    const payload: TokenData = tokenData;
    const validated = strategy.validate(mockRequest, payload);

    expect(validated).toEqual({
      ...payload,
      refreshToken: 'mock-refresh-token',
    });
  });
});
