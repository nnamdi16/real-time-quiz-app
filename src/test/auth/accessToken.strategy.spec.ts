import { Test, TestingModule } from '@nestjs/testing';
import { AccessTokenStrategy } from '../../api/auth/accessToken.strategy';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TokenData } from 'src/api/user/dto/user.dto';
import { tokenData } from '../user/stub/user.stub';

jest.mock('@nestjs/config');

describe('JwtStrategy', () => {
  let strategy: AccessTokenStrategy;

  beforeEach(async () => {
    (ConfigService as jest.Mock).mockImplementation(() => ({
      get: jest.fn().mockReturnValue('test-secret-key'), // Replace 'test-secret-key' with your mock secret key
    }));

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [AccessTokenStrategy, ConfigService],
    }).compile();

    strategy = module.get<AccessTokenStrategy>(AccessTokenStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the payload', () => {
      const payload: TokenData = tokenData;
      const result = strategy.validate(payload);
      expect(result).toEqual(payload);
    });
  });
});
