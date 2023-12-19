import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { quiz, quizPayload } from './stub/quiz.stub';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizService } from '../../api/quiz/quiz.service';
import { Quiz } from '../../api/quiz/quiz.entity';
import { tokenData, userData } from '../user/stub/user.stub';
import { UserService } from '../../api/user/user.service';

describe('QuestionService', () => {
  let quizService: QuizService;
  let quizRepository: Repository<Quiz>;
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
          provide: UserService,
          useValue: {
            findUserById: jest
              .fn()
              .mockImplementation(() => Promise.resolve(userData)),
          },
        },
      ],
    }).compile();
    quizService = module.get<QuizService>(QuizService);
    userService = module.get<UserService>(UserService);
    quizRepository = module.get<Repository<Quiz>>(getRepositoryToken(Quiz));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Quiz', () => {
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
          .mockImplementation(() => Promise.resolve(userData));
        const data = await quizService.create(quizPayload, tokenData);
        expect(data).toEqual({
          data: null,
          error: null,
          message: 'Quiz created successfully',
          status: 'success',
          statusCode: 201,
        });
      });
    });
    describe('find() method should successfully fetch all quiz', () => {
      test('should fetch all quizzes', async () => {
        jest
          .spyOn(quizRepository, 'find')
          .mockImplementation(() =>
            Promise.resolve([quiz] as unknown as Quiz[]),
          );

        const data = await quizService.getAll({ page: 1, limit: 10 });
        expect(data).toEqual({
          data: [quiz],
          error: null,
          message: 'Quiz fetched successfully',
          status: 'success',
          statusCode: 201,
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
  });
});
