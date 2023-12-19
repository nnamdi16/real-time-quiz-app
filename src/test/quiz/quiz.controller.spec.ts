import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from '../../api/quiz/quiz.controller';
import { QuizService } from '../../api/quiz/quiz.service';
import { quiz, quizPayload } from './stub/quiz.stub';
import { tokenData } from '../user/stub/user.stub';
import { Request } from 'express';

describe('Quiz controller', () => {
  let quizController: QuizController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        {
          provide: QuizService,
          useValue: {
            create: jest.fn().mockImplementation(() => Promise.resolve(quiz)),
            getAll: jest.fn().mockImplementation(() => Promise.resolve([quiz])),
          },
        },
      ],
    }).compile();
    quizController = module.get<QuizController>(QuizController);
  });

  describe('create() method should successfully create a quiz', () => {
    test('should create a quiz', async () => {
      const data = await quizController.create(
        { user: tokenData } as unknown as Request,
        quizPayload,
      );
      expect(data).toEqual(quiz);
    });
  });
  describe('getAll() method should successfully fetch all quiz', () => {
    test('should fetch all quiz', async () => {
      const data = await quizController.getAll({ page: 1, limit: 10 });
      expect(data).toEqual([quiz]);
    });
  });
});
