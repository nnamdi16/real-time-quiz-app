import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { IResponse, errorHandler } from '../../util/util';
import { Quiz } from './quiz.entity';
import { QuizDto } from './quiz.dto';
import { TokenData } from '../user/user.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  async create(
    payload: QuizDto,
    tokenData: TokenData,
  ): Promise<IResponse<Quiz>> {
    try {
      const { title } = payload;

      const user = await this.userService.findUserById(tokenData.id);

      if (!user) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'unathorised user',
        });
      }
      const isExistingQuiz = await this.quizRepository.exist({
        where: [{ title: ILike(title.toLowerCase()) }],
      });

      if (isExistingQuiz) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'quiz title already exists',
        });
      }
      await this.quizRepository.save({ ...payload, user });
      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Quiz created successfully Successful',
        data: null,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
    }
  }
}
