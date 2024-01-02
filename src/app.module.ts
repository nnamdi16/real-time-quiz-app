import { Module } from '@nestjs/common';
import { DatabaseModule } from './db/database.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { UserModule } from './api/user/module/user.module';
import { QuizModule } from './api/quiz/module/quiz.module';
import { RefreshTokenStrategy } from './api/auth/refreshToken.strategy';
import { AccessTokenStrategy } from './api/auth/accessToken.strategy';
import { NatsModule } from './api/nats/nats.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    QuizModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    NatsModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
  ],
  controllers: [],
  providers: [RefreshTokenStrategy, AccessTokenStrategy],
})
export class AppModule {}
