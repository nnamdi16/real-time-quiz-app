import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import morgan = require('morgan');
import { HttpExceptionFilter } from './interceptors/exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const config = new DocumentBuilder()
    .setTitle('QUIZ APP')
    .setDescription('QUIZ APP DOCUMENTATION')
    .setVersion('1.0')
    .addBearerAuth()
    .setExternalDoc('Postman Collection', '/api-json')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.enableCors();
  app.use(morgan('dev'));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useBodyParser('json', { limit: '10mb' });
  await app.listen(3000);
}
bootstrap();
