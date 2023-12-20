import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventBusService } from './event-bus.service';
import { EventsController } from './events.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        },
      },
    ]),
  ],
  controllers: [EventsController],
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventBusModule {}
