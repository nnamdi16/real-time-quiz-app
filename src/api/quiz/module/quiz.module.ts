import { Module } from '@nestjs/common';
import { QuizService } from '../services/quiz.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { QuizController } from '../controller/quiz.controller';
import { Quiz } from '../entity/quiz.entity';
import { Question } from '../entity/questions.entity';
import { Options } from '../entity/options.entity';
import { UserModule } from '../../user/module/user.module';
import { EventBusModule } from 'src/event-bus/event-bus.module';
import { Results } from '../entity/results.entity';
import { LeaderBoardController } from '../controller/leaderboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Question, Options, Results]),
    JwtModule.register({}),
    UserModule,
    EventBusModule,
  ],
  providers: [QuizService],
  controllers: [QuizController, LeaderBoardController],
  exports: [],
})
export class QuizModule {}