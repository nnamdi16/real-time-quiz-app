import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectionOptions, NatsConnection, connect } from 'nats';
import { ENV } from '../../constants';
import { AppGateway } from '../../app.gateway';

@Injectable()
export class NatService {
  private natsConnection: NatsConnection;
  constructor(
    private readonly configService: ConfigService,
    private readonly appGateway: AppGateway,
  ) {}

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
    this.natsConnection.publish(subject, data.message);
  }

  async subscribe(subject: string): Promise<void> {
    if (!this.natsConnection) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'connection not established.',
      });
    }

    this.natsConnection.subscribe(subject, {
      callback: (err, msg) => {
        if (err) {
          throw new BadRequestException({
            status: HttpStatus.BAD_REQUEST,
            message: err.message,
          });
        }
        this.appGateway.sendEventToClients('message', msg.data);
      },
    });
  }
}
