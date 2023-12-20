import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { QuizController } from './quiz.controller';
import { Quiz } from './quiz.entity';
import { Question } from './questions.entity';
import { Options } from './options.entity';
import { UserModule } from '../user/user.module';
import { EventBusModule } from 'src/event-bus/event-bus.module';
import { Results } from './results.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Question, Options, Results]),
    JwtModule.register({}),
    UserModule,
    EventBusModule,
  ],
  providers: [QuizService],
  controllers: [QuizController],
  exports: [],
})
export class QuizModule {}
