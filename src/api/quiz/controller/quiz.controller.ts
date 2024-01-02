import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuizService } from '../services/quiz.service';
import {
  QuestionParams,
  QuizDto,
  QuizParams,
  UserResponseDto,
} from '../dto/quiz.dto';
import { Request } from 'express';
import { TokenData } from '../../user/dto/user.dto';
import { AccessTokenGuard } from '../../auth/accessToken.guard';
import { Pagination } from '../../../shared/pagination.dto';
import { MessagePattern } from '@nestjs/microservices';

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

  @Get('')
  @ApiOperation({ summary: 'Endpoint to fetch all quizs' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async getAll(@Query() query: Pagination) {
    return await this.quizService.getAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Endpoint to get details of a particular quiz' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async getOne(
    @Param()
    params: QuizParams,
  ) {
    return await this.quizService.getOne(params.id);
  }

  @Post(':id/answer')
  @ApiOperation({ summary: 'Endpoint to submit an answer for a quiz question' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async submitAnswer(
    @Param()
    params: QuestionParams,
    @Body() body: UserResponseDto,
    @Req() auth: Request,
  ) {
    const { user } = auth;
    return await this.quizService.submitAnswer(
      params.id,
      body,
      user as unknown as TokenData,
    );
  }

  @Post(':id/participate')
  @ApiOperation({ summary: 'Endpoint to participate in a quiz' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async joinQuiz(
    @Param()
    params: QuizParams,
  ) {
    return await this.quizService.joinQuiz(params.id);
  }

  @Get(':id/score')
  @ApiOperation({
    summary: 'Endpoint to Get the current score of the participant in a quiz',
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async getScore(
    @Param()
    params: QuizParams,
    @Req() auth: Request,
  ) {
    const { user } = auth;
    return await this.quizService.getScore(
      params.id,
      user as unknown as TokenData,
    );
  }

  @MessagePattern('quiz')
  async getHello(data: string) {
    console.log('data: ', data);
    return 'Hello World!';
  }
}
