import {
  Catch,
  HttpException,
  ExceptionFilter,
  ArgumentsHost,
} from '@nestjs/common';
import { IResponse } from 'src/util/util';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.getResponse() as unknown as object;

    const data: Partial<IResponse<null>> = {
      status: 'fail',
      ...error,
      data: null,
    };

    response.status(status).json(data);
  }
}
