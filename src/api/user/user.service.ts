import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RegisterUserDto } from './user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { IResponse, errorHandler } from '../../util/util';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {}
  //Todo: Handle database error
  async registerUser(payload: RegisterUserDto): Promise<IResponse<UserEntity>> {
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
      const data = await this.userRepository.save(payload);
      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'User Registration Successful',
        data,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
    }
  }
}
