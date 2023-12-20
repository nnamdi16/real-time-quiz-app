import { Module } from '@nestjs/common';
import { DatabaseModule } from './db/database.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { UserModule } from './api/user/user.module';
import { QuizModule } from './api/quiz/quiz.module';
import { RefreshTokenStrategy } from './api/auth/refreshToken.strategy';
import { AccessTokenStrategy } from './api/auth/accessToken.strategy';
import { EventBusModule } from './event-bus/event-bus.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    QuizModule,
    EventBusModule,
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
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [RefreshTokenStrategy, AccessTokenStrategy],
})
export class AppModule {}
