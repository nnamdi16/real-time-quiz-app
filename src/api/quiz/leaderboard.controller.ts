import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { AccessTokenGuard } from '../auth/accessToken.guard';
import { TokenData } from '../user/user.dto';
import { QuizParams } from './quiz.dto';
import { Request } from 'express';

@Controller('v1/leaderboard')
@ApiTags('leaderboard')
export class LeaderBoardController {
  constructor(readonly quizService: QuizService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Endpoint to Get leader board for a particular quiz',
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async getLeaderboard(
    @Param()
    params: QuizParams,
    @Req() auth: Request,
  ) {
    const { user } = auth;
    return await this.quizService.getLeaderBoard(
      params.id,
      user as unknown as TokenData,
    );
  }
}
