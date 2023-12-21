import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { NatService } from './nats.service';
import { WebsocketGateway } from '../quiz/quiz.gateway';

@Module({
  providers: [NatService, WebsocketGateway],
  exports: [NatService],
})
export class NatsModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly natsService: NatService) {}

  async onModuleInit() {
    await this.natsService.connect();
  }

  async onModuleDestroy() {
    await this.natsService.close();
  }
}
