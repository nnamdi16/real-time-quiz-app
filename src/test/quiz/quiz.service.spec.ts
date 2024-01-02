import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockedLeaderBoard,
  mockedListOfQuiz,
  mockedOngoingQuiz,
  mockedQuestion,
  quiz,
  quizPayload,
} from './stub/quiz.stub';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { QuizService } from '../../api/quiz/services/quiz.service';
import { Quiz } from '../../api/quiz/entity/quiz.entity';
import { tokenData, userData } from '../user/stub/user.stub';
import { UserService } from '../../api/user/services/user.service';
import { Question } from '../../api/quiz/entity/questions.entity';
import { Results } from '../../api/quiz/entity/results.entity';
import { UserResponseDto } from '../../api/quiz/dto/quiz.dto';
import { NatService } from '../../api/nats/nats.service';

describe('QuestionService', () => {
  let quizService: QuizService;
  let quizRepository: Repository<Quiz>;
  let resultRepository: Repository<Results>;
  let questionRepository: Repository<Question>;
  let userService: UserService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: getRepositoryToken(Quiz),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Question),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Results),
          useClass: Repository,
        },
        {
          provide: UserService,
          useValue: {
            findUserById: jest
              .fn()
              .mockImplementation(() => Promise.resolve(userData)),
          },
        },
        {
          provide: NatService,
          useValue: {
            publish: jest.fn().mockImplementation(() => Promise.resolve()),
            subscribeQuizCreatedEvent: jest
              .fn()
              .mockImplementation(() => Promise.resolve()),
          },
        },
      ],
    }).compile();
    quizService = module.get<QuizService>(QuizService);
    userService = module.get<UserService>(UserService);
    quizRepository = module.get<Repository<Quiz>>(getRepositoryToken(Quiz));
    resultRepository = module.get<Repository<Results>>(
      getRepositoryToken(Results),
    );
    questionRepository = module.get<Repository<Question>>(
      getRepositoryToken(Question),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Quiz Service', () => {
    describe('create() method should throw error', () => {
      test('should throw error if a quiz already exist', async () => {
        try {
          jest
            .spyOn(quizRepository, 'exist')
            .mockImplementation(() => Promise.resolve(true));
          await quizService.create(quizPayload, tokenData);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('quiz title already exists');
          expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      });
      test('should throw error unauthorised if user does not exist', async () => {
        try {
          jest
            .spyOn(userService, 'findUserById')
            .mockImplementation(() => Promise.resolve(null));
          jest
            .spyOn(quizRepository, 'exist')
            .mockImplementation(() => Promise.reject(new Error()));
          await quizService.create(quizPayload, tokenData);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('unathorised user');
          expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        }
      });
      test('should throw error an internal server error when an error occurs from the db', async () => {
        try {
          jest
            .spyOn(quizRepository, 'exist')
            .mockImplementation(() => Promise.reject(new Error()));
          await quizService.create(quizPayload, tokenData);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
    });
    describe('create() method should successfully create a quiz', () => {
      test('should save a quiz', async () => {
        jest
          .spyOn(quizRepository, 'exist')
          .mockImplementation(() => Promise.resolve(false));
        jest
          .spyOn(quizRepository, 'save')
          .mockImplementation(() => Promise.resolve(quiz as unknown as Quiz));
        const data = await quizService.create(quizPayload, tokenData);
        expect(data).toEqual({
          data: quiz.id,
          error: null,
          message: 'Quiz created successfully',
          status: 'success',
          statusCode: 201,
        });
      });
    });
    describe('getAll() method should successfully fetch all quiz', () => {
      test('should fetch all quizzes', async () => {
        jest
          .spyOn(quizRepository, 'find')
          .mockImplementation(() =>
            Promise.resolve(mockedListOfQuiz.data as unknown as Quiz[]),
          );

        const data = await quizService.getAll({ page: 1, limit: 10 });
        expect(data).toEqual({
          data: mockedListOfQuiz.data,
          error: null,
          message: 'Quiz fetched successfully',
          status: 'success',
          statusCode: 200,
        });
      });

      test('should throw error an internal server error when an error occurs from the db', async () => {
        try {
          jest
            .spyOn(quizRepository, 'find')
            .mockImplementation(() => Promise.reject(new Error()));
          await quizService.getAll({ page: 1, limit: 10 });
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
    });
    describe('getOne() method should successfully fetch one quiz', () => {
      const quizId = '217d86fb-2c0f-46c7-975b-21635e1d7f62';
      test('should fetch a quiz', async () => {
        jest
          .spyOn(quizRepository, 'findOne')
          .mockImplementation(() => Promise.resolve(quiz as unknown as Quiz));
        const data = await quizService.getOne(quizId);
        expect(data).toEqual({
          data: quiz,
          error: null,
          message: 'Quiz fetched successfully',
          status: 'success',
          statusCode: 200,
        });
      });

      test('should throw error an internal server error when an error occurs from the db', async () => {
        try {
          jest
            .spyOn(quizRepository, 'findOne')
            .mockImplementation(() => Promise.reject(new Error()));
          await quizService.getOne(quizId);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
    });

    describe('joinQuiz() method should successfully add a user to a quiz', () => {
      const quizId = '217d86fb-2c0f-46c7-975b-21635e1d7f62';
      test('should fetch a quiz', async () => {
        jest
          .spyOn(quizRepository, 'findOne')
          .mockImplementation(() => Promise.resolve(quiz as unknown as Quiz));
        const data = await quizService.joinQuiz(quizId);
        expect(data).toEqual({
          data: quiz,
          error: null,
          message: `Successfully joined ${quiz.title} quiz`,
          status: 'success',
          statusCode: 200,
        });
      });

      test('should throw error an internal server error when an error occurs from the db', async () => {
        try {
          jest
            .spyOn(quizRepository, 'findOne')
            .mockImplementation(() => Promise.reject(new Error()));
          await quizService.joinQuiz(quizId);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
    });

    describe("submitAnswer() method should successfully submit a user's answer and calculate the score ", () => {
      const questionId = 'f448b672-f8e5-42b1-b4d4-1062b9065a68';
      const options = ['53e67897-ba7c-4846-93e1-7f910446d35a'];
      const mockResultQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };
      const mockQuestionQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockedQuestion),
      };
      test('should fetch submit answer', async () => {
        jest
          .spyOn(questionRepository, 'createQueryBuilder')
          .mockReturnValue(
            mockQuestionQueryBuilder as unknown as SelectQueryBuilder<Question>,
          );

        jest
          .spyOn(resultRepository, 'createQueryBuilder')
          .mockReturnValue(
            mockResultQueryBuilder as unknown as SelectQueryBuilder<Results>,
          );
        jest
          .spyOn(resultRepository, 'findOne')
          .mockResolvedValue(mockedOngoingQuiz as unknown as Results);

        jest.spyOn(mockedQuestion.options, 'every').mockReturnValue(true);
        jest.spyOn(mockedOngoingQuiz.response, 'some').mockReturnValue(false);
        jest.spyOn(mockedQuestion.options, 'includes').mockReturnValue(true);

        const data = await quizService.submitAnswer(
          questionId,
          options as unknown as UserResponseDto,
          userData,
        );
        expect(mockResultQueryBuilder.update).toHaveBeenCalledWith(Results);
        expect(mockResultQueryBuilder.set).toHaveBeenCalledWith({
          score: expect.any(Function),
          totalScore: expect.any(Function),
          streakCount: expect.any(Number),
          response: expect.any(Array),
        });
        expect(mockResultQueryBuilder.where).toHaveBeenCalledWith('id = :id', {
          id: mockedOngoingQuiz.id,
        });
        expect(mockResultQueryBuilder.execute).toHaveBeenCalled();
        expect(data).toEqual({
          data: null,
          error: null,
          message: 'The provided answer is correct',
          status: 'success',
          statusCode: 200,
        });
      });
      test('should submit answer at the first attempt of a quiz by a user', async () => {
        jest
          .spyOn(questionRepository, 'createQueryBuilder')
          .mockReturnValue(
            mockQuestionQueryBuilder as unknown as SelectQueryBuilder<Question>,
          );

        jest.spyOn(resultRepository, 'findOne').mockResolvedValue(null);
        jest
          .spyOn(resultRepository, 'save')
          .mockResolvedValue(mockedOngoingQuiz as unknown as Results);

        jest.spyOn(mockedQuestion.options, 'every').mockReturnValue(true);
        jest.spyOn(mockedQuestion.options, 'includes').mockReturnValue(true);
        jest.spyOn(mockedOngoingQuiz.response, 'some').mockReturnValue(false);

        const data = await quizService.submitAnswer(
          questionId,
          options as unknown as UserResponseDto,
          userData,
        );

        expect(data).toEqual({
          data: null,
          error: null,
          message: 'The provided answer is correct',
          status: 'success',
          statusCode: 200,
        });
      });
      test("should throw error when the option doesn't exist", async () => {
        try {
          jest.spyOn(questionRepository, 'createQueryBuilder').mockReturnValue({
            ...mockQuestionQueryBuilder,
            getOne: jest
              .fn()
              .mockResolvedValue({ ...mockedQuestion, options: [] }),
          } as unknown as SelectQueryBuilder<Question>);

          await quizService.submitAnswer(
            questionId,
            options as unknown as UserResponseDto,
            userData,
          );
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('Question Unavailable');
          expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        }
      });
      test('should throw error attempting an answered question', async () => {
        try {
          jest
            .spyOn(questionRepository, 'createQueryBuilder')
            .mockReturnValue(
              mockQuestionQueryBuilder as unknown as SelectQueryBuilder<Question>,
            );

          jest
            .spyOn(resultRepository, 'createQueryBuilder')
            .mockReturnValue(
              mockResultQueryBuilder as unknown as SelectQueryBuilder<Results>,
            );

          jest
            .spyOn(resultRepository, 'findOne')
            .mockResolvedValue(mockedOngoingQuiz as unknown as Results);

          jest.spyOn(mockedQuestion.options, 'every').mockReturnValue(true);
          jest.spyOn(mockedOngoingQuiz.response, 'some').mockReturnValue(true);
          jest.spyOn(mockedQuestion.options, 'includes').mockReturnValue(true);

          await quizService.submitAnswer(
            questionId,
            options as unknown as UserResponseDto,
            userData,
          );
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('Question already answered');
          expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        }
      });
    });
    describe("getScore() method should successfully retrieve a use's score", () => {
      const quizId = '217d86fb-2c0f-46c7-975b-21635e1d7f62';
      const mockResultQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          score: 2,
        } as unknown as Results),
      };

      test('should fetch submit answer', async () => {
        jest
          .spyOn(resultRepository, 'createQueryBuilder')
          .mockReturnValue(
            mockResultQueryBuilder as unknown as SelectQueryBuilder<Results>,
          );

        jest.spyOn(mockedQuestion.options, 'every').mockReturnValue(true);
        jest.spyOn(mockedQuestion.options, 'includes').mockReturnValue(true);

        const data = await quizService.getScore(quizId, userData);

        expect(data).toEqual({
          data: {
            score: 2,
          },
          error: null,
          message: 'User score retrieved successfully',
          status: 'success',
          statusCode: 200,
        });
      });

      test('should throw error if the query fails', async () => {
        try {
          jest.spyOn(resultRepository, 'createQueryBuilder').mockReturnValue({
            ...mockResultQueryBuilder,
            getOne: jest.fn().mockResolvedValue(null),
          } as unknown as SelectQueryBuilder<Results>);

          await quizService.getScore(quizId, userData);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('Score not found');
          expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        }
      });
    });
    describe("getLeaderBoard() method should successfully display user's standing amongst other participant", () => {
      const quizId = '217d86fb-2c0f-46c7-975b-21635e1d7f62';
      const mockResultQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest
          .fn()
          .mockResolvedValue(mockedLeaderBoard.data as unknown as Results[]),
      };

      test('should fetch submit answer', async () => {
        jest
          .spyOn(resultRepository, 'findOne')
          .mockResolvedValue(mockedOngoingQuiz as unknown as Results);
        jest
          .spyOn(resultRepository, 'createQueryBuilder')
          .mockReturnValue(
            mockResultQueryBuilder as unknown as SelectQueryBuilder<Results>,
          );

        const data = await quizService.getLeaderBoard(quizId, userData);

        expect(data).toEqual({
          data: mockedLeaderBoard.data,
          error: null,
          message: 'User score retrieved successfully',
          status: 'success',
          statusCode: 200,
        });
      });

      test('should throw error if the query fails', async () => {
        try {
          jest.spyOn(resultRepository, 'findOne').mockResolvedValue(null);
          jest
            .spyOn(resultRepository, 'createQueryBuilder')
            .mockReturnValue(
              mockResultQueryBuilder as unknown as SelectQueryBuilder<Results>,
            );

          await quizService.getLeaderBoard(quizId, userData);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.message).toBe('Access Denied');
          expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        }
      });
    });
  });
});
