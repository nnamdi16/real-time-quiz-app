import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, RegisterUserDto, TokenData, TokenDto } from './user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { IResponse, errorHandler } from '../../util/util';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ENV } from '../../constants';
import EncryptService from '../../util/encryption';
import { UUID } from 'crypto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(EncryptService)
    private readonly encryptionService: EncryptService,
  ) {}
  //Todo: Handle database error
  async registerUser(payload: RegisterUserDto): Promise<IResponse<User>> {
    try {
      const { email, password, username } = payload;

      const isExistingUser = await this.userRepository.exist({
        where: [{ email }, { username }],
      });
      //Todo: Look into this
      if (isExistingUser) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Email or username already exists',
        });
      }
      if (password) {
        payload.password = await bcrypt.hash(
          payload.password,
          parseInt(this.configService.get('SALT_ROUNDS'), 10) || 10,
        );
      }
      await this.userRepository.save(payload);
      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'User Registration Successful',
        data: null,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
    }
  }

  async login(payload: LoginDto): Promise<IResponse<TokenDto>> {
    try {
      const { username, password } = payload;
      const userDetails = await this.userRepository.findOne({
        where: [{ username }],
      });
      if (!userDetails || !password) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Login failed',
        });
      }

      const isPasswordMatch = await bcrypt.compare(
        password,
        userDetails.password,
      );
      if (!isPasswordMatch) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid login',
        });
      }
      const tokenData: TokenData = {
        id: userDetails.id,
        email: userDetails.email,
        username: userDetails.username,
      };

      const { accessToken, refreshToken } = await this.updateToken(tokenData);
      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Authentication successful',
        data: { accessToken, refreshToken },
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
    }
  }

  async updateToken(
    tokenData: TokenData,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken, refreshToken } = await this.getTokens(tokenData);
    const encryptRefreshToken =
      await this.encryptionService.encrypt(refreshToken);
    await this.userRepository.update(
      {
        email: tokenData.email,
      },
      { refreshToken: encryptRefreshToken },
    );
    return { accessToken, refreshToken };
  }

  async getTokens(
    payload: TokenData,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(ENV.JWT_ACCESS_TOKEN_SECRET),
        expiresIn: this.configService.get<string>(
          ENV.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(ENV.JWT_REFRESH_TOKEN_SECRET),
        expiresIn: this.configService.get<string>(
          ENV.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
        ),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async findUserById(id: UUID): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }
}
