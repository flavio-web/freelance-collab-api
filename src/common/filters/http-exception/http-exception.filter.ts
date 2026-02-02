import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse() as {
      message: string | string[];
      error: string;
      statusCode: number;
    };
    let errors: string[] = [];

    let message: string | string[] = 'Error inesperado';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      message =
        exceptionResponse.message instanceof Array
          ? exceptionResponse.message[0]
          : exceptionResponse.message;
      errors = exceptionResponse.message instanceof Array ? exceptionResponse.message : [];
    }

    response.status(statusCode).json({
      status: false,
      message,
      error: exception.name,
      errors,
    });
  }
}
