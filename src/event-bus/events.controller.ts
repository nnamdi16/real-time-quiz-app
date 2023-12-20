import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';

@Controller()
export class EventsController {
  @MessagePattern({ cmd: 'newQuiz' }, Transport.NATS)
  async emitNewQuizEvent(@Payload() data: any): Promise<void> {
    console.log('I was waiting to be called');
    // Business logic to handle the 'newQuiz' event
    console.log(`New quiz created: ${data.quizName} (ID: ${data.quizId})`);
  }
}
