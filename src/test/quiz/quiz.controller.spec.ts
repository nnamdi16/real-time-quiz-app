import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from '../../api/quiz/controller/quiz.controller';
import { QuizService } from '../../api/quiz/services/quiz.service';
import { quiz, quizParams, quizPayload } from './stub/quiz.stub';
import { tokenData, userData } from '../user/stub/user.stub';
import { Request } from 'express';
import { UUID } from 'crypto';

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
            getOne: jest.fn().mockImplementation(() => Promise.resolve(quiz)),
            submitAnswer: jest
              .fn()
              .mockImplementation(() => Promise.resolve(null)),
            getScore: jest.fn().mockImplementation(() =>
              Promise.resolve({
                score: 2,
              }),
            ),
            joinQuiz: jest.fn().mockImplementation(() => Promise.resolve(quiz)),
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
  describe('submitAnswer() method should successfully submit an answer', () => {
    const questionId = 'f448b672-f8e5-42b1-b4d4-1062b9065a68';
    const options = [
      '53e67897-ba7c-4846-93e1-7f910446d35a',
    ] as unknown as UUID[];
    test('should fetch a quiz', async () => {
      const data = await quizController.submitAnswer(
        { id: questionId },
        { options },
        userData,
      );
      expect(data).toEqual(null);
    });
  });
  describe('getOne() method should successfully fetch a quiz', () => {
    test('should fetch a quiz', async () => {
      const data = await quizController.getOne(quizParams);
      expect(data).toEqual(quiz);
    });
  });
  describe('getScore() method should successfully fetch the score', () => {
    test('should fetch the score', async () => {
      const data = await quizController.getScore(quizParams, userData);
      expect(data).toEqual({ score: 2 });
    });
  });
  describe('joinQuiz() method should successfully add a user to a quiz', () => {
    test('should fetch the questions successfully', async () => {
      const data = await quizController.joinQuiz(quizParams, {
        user: tokenData,
      } as unknown as Request);
      expect(data).toEqual(quiz);
    });
  });
});
