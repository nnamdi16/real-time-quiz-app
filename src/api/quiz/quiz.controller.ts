import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { QuizDto } from './quiz.dto';
import { Request } from 'express';
import { TokenData } from '../user/user.dto';
import { AccessTokenGuard } from '../auth/accessToken.guard';

@Controller('v1/quizzes')
@ApiTags('quizzes')
export class QuizController {
  constructor(readonly quizService: QuizService) {}

  @Post('')
  @ApiOperation({ summary: 'Endpoint to create quiz' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async create(@Req() auth: Request, @Body() body: QuizDto) {
    const { user } = auth;
    return await this.quizService.create(body, user as unknown as TokenData);
  }
}
