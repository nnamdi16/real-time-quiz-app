import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectionOptions,
  Msg,
  NatsConnection,
  NatsError,
  Subscription,
  connect,
} from 'nats';
import { ENV } from 'src/constants';

@Injectable()
export class NatService {
  private natsConnection: NatsConnection;
  constructor(private readonly configService: ConfigService) {}

  async connect() {
    const natsUrl =
      this.configService.get(ENV.NATS_URL) || 'nats://localhost:4222';
    const opts: ConnectionOptions = {
      servers: [natsUrl],
      debug: true,
    };
    this.natsConnection = await connect(opts);
  }

  async close() {
    if (this.natsConnection) {
      await this.natsConnection.close();
    }
  }

  publish(subject: string, data: any): void {
    if (!this.natsConnection) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'connection not established.',
      });
    }

    this.natsConnection.publish(subject, data);
  }

  subscribe(
    subject: string,
    callback: (err: NatsError | null, msg: Msg) => void,
  ): Subscription {
    if (!this.natsConnection) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'connection not established.',
      });
    }

    return this.natsConnection.subscribe(subject, { callback });
  }
}
