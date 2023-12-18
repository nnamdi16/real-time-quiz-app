import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { IResponse, errorHandler } from '../../util/util';
import { Quiz } from './quiz.entity';
import { QuizDto } from './quiz.dto';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
  ) {}

  async create(payload: QuizDto): Promise<IResponse<Quiz>> {
    try {
      const { title } = payload;

      const isExistingQuiz = await this.quizRepository.exist({
        where: [{ title: ILike(title.toLowerCase()) }],
      });

      if (isExistingQuiz) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'quiz title already exists',
        });
      }
      const data = await this.quizRepository.save(payload);
      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Quiz created successfully Successful',
        data,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
    }
  }
}
