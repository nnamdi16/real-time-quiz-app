import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { QuizController } from './quiz.controller';
import { Quiz } from './quiz.entity';
import { Question } from './questions.entity';
import { Options } from './options.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Question, Options]),
    JwtModule.register({}),
  ],
  providers: [QuizService],
  controllers: [QuizController],
  exports: [],
})
export class QuizModule {}