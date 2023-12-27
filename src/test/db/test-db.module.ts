import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Options } from '../../api/quiz/entity/options.entity';
import { Question } from '../../api/quiz/entity/questions.entity';
import { Quiz } from '../../api/quiz/entity/quiz.entity';
import { Results } from '../../api/quiz/entity/results.entity';
import { User } from '../../api/user/entity/user.entity';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'postgres'),
          database: configService.get<string>('DB_NAME', 'quiz-app'),
          synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
          dropSchema: configService.get<boolean>('DB_DROP_SCHEMA', true),
          entities: [User, Options, Question, Results, Quiz],
          logging: configService.get<boolean>('DB_LOGGING', true),
          migrationsTableName: 'migration',
          migrations: ['src/migration/*.ts'],
          migrationsRun: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class TestDbModule {}
