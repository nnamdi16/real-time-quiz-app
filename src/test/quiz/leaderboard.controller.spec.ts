import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from '../../api/quiz/services/quiz.service';
import { mockedLeaderBoard, quizParams } from './stub/quiz.stub';
import { userData } from '../user/stub/user.stub';
import { LeaderBoardController } from '../../api/quiz/controller/leaderboard.controller';

describe('Leaderboard controller', () => {
  let leaderboardController: LeaderBoardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaderBoardController],
      providers: [
        {
          provide: QuizService,
          useValue: {
            getLeaderBoard: jest
              .fn()
              .mockImplementation(() => Promise.resolve(mockedLeaderBoard)),
          },
        },
      ],
    }).compile();
    leaderboardController = module.get<LeaderBoardController>(
      LeaderBoardController,
    );
  });

  describe('getLeaderboard() method should successfully display a quiz leaderboard', () => {
    test('should create a quiz', async () => {
      const data = await leaderboardController.getLeaderboard(
        quizParams,
        userData,
      );
      expect(data).toEqual(mockedLeaderBoard);
    });
  });
});
