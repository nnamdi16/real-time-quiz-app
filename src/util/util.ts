import { HttpException, HttpStatus } from '@nestjs/common';

export interface IResponse<T> {
  status: 'success' | 'fail';
  message: string;
  statusCode: HttpStatus;
  data: T;
  error: any;
  meta?: any;
}

export const errorHandler = (error: Record<string, any>) => {
  if (error instanceof HttpException) {
    throw new HttpException(error.getResponse(), error.getStatus());
  } else {
    throw new HttpException(
      { ...error },
      error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export const handlePagination = (
  page: number,
  limit: number,
): { skip: number; take: number } => {
  return { skip: +((page - 1) * limit ?? 0), take: +(limit ?? 10) };
};
