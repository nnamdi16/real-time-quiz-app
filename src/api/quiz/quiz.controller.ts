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
import { QuizService } from './quiz.service';
import { QuizDto, QuizParams } from './quiz.dto';
import { Request } from 'express';
import { TokenData } from '../user/user.dto';
import { AccessTokenGuard } from '../auth/accessToken.guard';
import { Pagination } from '../shared/pagination.dto';

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
  @ApiOperation({ summary: 'Endpoint to fetch all quizs' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async getOne(
    @Param()
    params: QuizParams,
  ) {
    return await this.quizService.getOne(params.id);
  }
}
