import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { QuizDto } from './quiz.dto';

@Controller('v1/quizzes')
@ApiTags('quizzes')
export class QuizController {
  constructor(readonly quizService: QuizService) {}

  @Post('')
  @ApiOperation({ summary: 'Endpoint to create quiz' })
  @ApiBearerAuth()
  async create(@Body() body: QuizDto) {
    return await this.quizService.create(body);
  }
}
