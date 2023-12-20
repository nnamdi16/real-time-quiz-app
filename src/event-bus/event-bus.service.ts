import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NewQuizEventDto } from 'src/api/quiz/quiz.dto';

@Injectable()
export class EventBusService {
  constructor(@Inject('NATS_SERVICE') private client: ClientProxy) {}

  async emitNewQuizEvent(quizId: string, quizName: string): Promise<void> {
    console.log('I was called', quizId, quizName);
    const newQuizEvent: NewQuizEventDto = { quizId, quizName };
    this.client.emit({ cmd: 'newQuiz' }, newQuizEvent);
    // await firstValueFrom(this.client.emit('newQuiz', newQuizEvent));
  }

  //   @MessagePattern({ cmd: 'newQuiz' }, Transport.NATS)
  //   handleNewQuizEvent(@Payload() data: any): void {
  //     console.log('I was waiting to be called');
  //     // Business logic to handle the 'newQuiz' event
  //     console.log(`New quiz created: ${data.quizName} (ID: ${data.quizId})`);
  //   }
}
// this.eventBusClient = ClientProxyFactory.create({
//   transport: Transport.NATS,
//   options: {
//     url: 'nats://localhost:4222', // Replace with your NATS server URL
//   },
// });
