import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { NatService } from './nats.service';
import { AppGateway } from '../../app.gateway';

@Module({
  providers: [NatService, AppGateway],
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
