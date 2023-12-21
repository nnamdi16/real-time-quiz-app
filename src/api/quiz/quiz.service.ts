import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { IResponse, errorHandler, handlePagination } from '../../util/util';
import { Quiz } from './quiz.entity';
import { QuizDto, TestStatus, UserResponse, UserResponseDto } from './quiz.dto';
import { TokenData } from '../user/user.dto';
import { UserService } from '../user/user.service';
import { Pagination } from '../../shared/pagination.dto';
import { UUID } from 'crypto';
import { Question } from './questions.entity';
import { Results } from './results.entity';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private readonly questionRespository: Repository<Question>,
    @InjectRepository(Results)
    private readonly resultRepository: Repository<Results>,
    @Inject(UserService)
    private readonly userService: UserService,
    // @Inject(EventBusService)
    // private readonly eventService: EventBusService,
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
        message: 'Quiz created successfully',
        data: null,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
    }
  }

  async getAll(payload: Pagination): Promise<IResponse<Quiz[]>> {
    try {
      const { take, skip } = handlePagination(payload.page, payload.limit);
      const data = await this.quizRepository.find({
        take,
        skip,
        relations: ['questions', 'questions.options'],
      });

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Quiz fetched successfully',
        data: data,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
    }
  }

  async getOne(id: UUID): Promise<IResponse<Quiz>> {
    try {
      const data = await this.quizRepository.findOne({
        where: { id },
        relations: ['questions', 'questions.options'],
      });
      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Quiz fetched successfully',
        data: data,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
    }
  }
  async joinQuiz(id: UUID): Promise<IResponse<Quiz>> {
    try {
      const data = await this.quizRepository.findOne({
        where: { id },
        relations: ['questions', 'questions.options'],
      });
      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Successfully joined a quiz',
        data,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
    }
  }
  async submitAnswer(
    id: UUID,
    { options }: UserResponseDto,
    user: TokenData,
  ): Promise<IResponse<Question>> {
    try {
      const data = await this.questionRespository
        .createQueryBuilder('questions')
        .innerJoinAndSelect('questions.quiz', 'quiz')
        .innerJoinAndSelect(
          'questions.options',
          'options',
          'options.isCorrect = :isCorrect',
          { isCorrect: true },
        )
        .where('questions.id = :id', { id })
        .getOne();

      if (!data?.options.length) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Question Unavailable',
        });
      }
      const ongoingQuiz = await this.resultRepository.findOne({
        where: {
          user: {
            id: user.id,
          },
          quiz: {
            id: data.quiz.id,
          },
          status: TestStatus.ONGOING,
        },
      });

      const compareUserAnswer = data.options.every((option) =>
        options.includes(option.id),
      );
      const userResponse: UserResponse = { question: data.id, options };

      if (!ongoingQuiz) {
        await this.resultRepository.save({
          status: TestStatus.ONGOING,
          quiz: data.quiz,
          user,
          response: [userResponse],
          score: compareUserAnswer ? 1 : 0,
        });
      } else {
        await this.resultRepository
          .createQueryBuilder()
          .update(Results)
          .set({
            score: () => `score + ${compareUserAnswer ? 1 : 0}`,
            response: [...ongoingQuiz.response, userResponse],
          })
          .where('id = :id', { id: ongoingQuiz.id })
          .execute();
      }
      const responseMessage = compareUserAnswer ? 'correct' : 'incorrect';
      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: `The provided answer is ${responseMessage}`,
        data: null,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
    }
  }

  async getScore(id: UUID, user: TokenData): Promise<IResponse<Results>> {
    try {
      const data = await this.resultRepository
        .createQueryBuilder('result')
        .leftJoinAndSelect('result.user', 'user')
        .leftJoinAndSelect('result.quiz', 'quiz')
        .where('user.id = :userId', { userId: user.id })
        .andWhere('quiz.id = :quizId', { quizId: id })
        .andWhere('result.status = :status', { status: TestStatus.ONGOING })
        .select(['result.score'])
        .getOne();
      if (!data) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Score not found',
        });
      }
      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User score retrieved successfully',
        data,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
    }
  }

  async getLeaderBoard(
    quizId: UUID,
    user: TokenData,
  ): Promise<IResponse<Results[]>> {
    try {
      const checkUserParticipation = await this.resultRepository.findOne({
        where: { user: { id: user.id } },
      });
      if (!checkUserParticipation) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Access Denied',
        });
      }
      const data = await this.resultRepository
        .createQueryBuilder('results')
        .leftJoinAndSelect('results.user', 'users')
        .leftJoinAndSelect('results.quiz', 'quiz')
        .where('quiz.id = :quizId', { quizId: quizId })
        .select(['results.score', 'users.username'])
        .orderBy('results.score')
        .getMany();
      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User score retrieved successfully',
        data,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
    }
  }
}
