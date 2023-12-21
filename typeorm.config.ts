import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Options } from 'src/api/quiz/entity/options.entity';
import { Question } from 'src/api/quiz/entity/questions.entity';
import { Quiz } from 'src/api/quiz/entity/quiz.entity';
import { Results } from 'src/api/quiz/entity/results.entity';
import { DataSource } from 'typeorm';


const configService = new ConfigService();
config();
export default new DataSource({
  type: 'postgres',
  host: configService.getOrThrow('POSTGRES_HOST'),
  port: configService.getOrThrow('POSTGRES_PORT'),
  database: configService.getOrThrow('POSTGRES_USER'),
  username: configService.getOrThrow('POSTGRES_PASSWORD'),
  password: configService.getOrThrow('POSTGRES_DB'),
  migrations: ['migrations/**'],
  entities: [Options, Question, Quiz, Results],
});
