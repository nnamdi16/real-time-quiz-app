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
import { IResponse, errorHandler, handlePagination } from '../../../util/util';
import { Quiz } from '../entity/quiz.entity';
import {
  QuizDto,
  TestStatus,
  UserResponse,
  UserResponseDto,
} from '../dto/quiz.dto';
import { TokenData } from '../../user/dto/user.dto';
import { UserService } from '../../user/services/user.service';
import { Pagination } from '../../../shared/pagination.dto';
import { UUID } from 'crypto';
import { Question } from '../entity/questions.entity';
import { Results } from '../entity/results.entity';
import { NatService } from '../../nats/nats.service';

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
    @Inject(NatService)
    private readonly natservice: NatService,
  ) {}

  async create(
    payload: QuizDto,
    tokenData: TokenData,
  ): Promise<IResponse<string>> {
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
      const { id } = await this.quizRepository.save({ ...payload, user });

      await this.natservice.subscribe('quiz_created');
      this.natservice.publish('quiz_created', {
        message: `A new quiz ${payload.title} has been created`,
      });
      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Quiz created successfully',
        data: id,
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
  async joinQuiz(quizId: UUID, user: TokenData): Promise<IResponse<Quiz>> {
    try {
      const data = await this.quizRepository.findOne({
        where: { id: quizId },
        relations: ['questions', 'questions.options'],
      });
      await this.natservice.subscribe('join_quiz');
      this.natservice.publish('join_quiz', {
        message: `${user.username} joined ${data.title}`,
      });
      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: `Successfully joined ${data.title} quiz`,
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

      const { streakCount, streakScore, score, correctAnswer } =
        this.calculateStreak(data, ongoingQuiz, options);
      const userResponse: UserResponse = { question: data.id, options };
      if (!ongoingQuiz) {
        await this.resultRepository.save({
          status: TestStatus.ONGOING,
          quiz: data.quiz,
          user,
          response: [userResponse],
          score,
          totalScore: streakCount + score,
          streakCount,
        });
      } else {
        const isAnsweredQuestion = ongoingQuiz.response.some(
          (obj) => obj.question === userResponse.question,
        );
        if (isAnsweredQuestion) {
          throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Question already answered',
          });
        }
        await this.resultRepository
          .createQueryBuilder()
          .update(Results)
          .set({
            score: () => `score + ${score}`,
            totalScore: () => `totalScore + ${streakScore} + ${score}`,
            streakCount,
            response: [...ongoingQuiz.response, userResponse],
          })
          .where('id = :id', { id: ongoingQuiz.id })
          .execute();
      }
      const responseMessage = correctAnswer ? 'correct' : 'incorrect';
      await this.natservice.subscribe('quiz_leaderboard');
      const quizResults = await this.getQuizResults(data.quiz.id);
      this.natservice.publish('quiz_leaderboard', quizResults);
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

  calculateStreak(question: Question, result: Results, options: UUID[]) {
    let streakCount: number;
    let streakScore: number;
    const correctAnswer = question.options.every((option) => {
      return options.includes(option.id);
    });
    const score = correctAnswer ? 1 : 0;
    if (!result) {
      streakCount = !correctAnswer ? 0 : 1;
      streakScore = correctAnswer ? question.quiz.streakScore : 0;
      return { streakCount, streakScore, correctAnswer, score };
    }
    streakCount =
      result.streakCount + 1 === question.quiz.streak || !correctAnswer
        ? 0
        : result.streakCount + 1;

    streakScore =
      streakCount === 0 && correctAnswer ? question.quiz.streakScore : 0;
    return { streakCount, streakScore, correctAnswer, score };
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
        .select(['result.score', 'result.totalScore', 'result.streakScore'])
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
  async getQuizResults(quizId: UUID): Promise<Results[]> {
    return await this.resultRepository
      .createQueryBuilder('results')
      .leftJoinAndSelect('results.user', 'users')
      .leftJoinAndSelect('results.quiz', 'quiz')
      .where('quiz.id = :quizId', { quizId: quizId })
      .select(['results.score', 'users.username'])
      .orderBy('results.score')
      .getMany();
  }

  async getLeaderBoard(
    quizId: UUID,
    user: TokenData,
  ): Promise<IResponse<Results[]>> {
    try {
      const checkUserParticipation = await this.resultRepository.findOne({
        where: { user: { id: user.id }, quiz: { id: quizId } },
      });
      if (!checkUserParticipation) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Access Denied',
        });
      }
      const data = await this.getQuizResults(quizId);
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
