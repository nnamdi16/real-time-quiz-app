import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENV } from '../constants';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        name: 'quiz-app',
        type: 'postgres',
        host: configService.get(ENV.POSTGRES_HOST),
        port: Number(configService.get(ENV.POSTGRES_PORT)),
        username: configService.get(ENV.POSTGRES_USER),
        password: configService.get(ENV.POSTGRES_PASSWORD),
        database: configService.get(ENV.POSTGRES_DB),
        logging: true,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
        migrationsTableName: 'migration',
        migrations: ['src/migration/*.ts'],
        migrationsRun: true,
        cli: {
          migrationsDir: 'src/api/migration',
        },
        seeds: ['src/api/seeds/**/*{.ts,.js}'],
        factories: ['src/factories/**/*{.ts,.js}'],
      }),
    }),
  ],
})
export class DatabaseModule {}
