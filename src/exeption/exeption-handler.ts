import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLogger } from './error-logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : exception instanceof ErrorLogger
        ? exception.statusCode
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : exception.message || 'Internal Server Error';

    const isHttpException = exception instanceof HttpException;
    const isCustomError = exception instanceof ErrorLogger;

    const responseBody = isHttpException ? exception.getResponse() : null;
    const extractedMessage =
      typeof responseBody === 'string'
        ? responseBody
        : (responseBody as any)?.message || message;

    const extractedCode =
      isCustomError
        ? exception.code
        : (responseBody as any)?.code || 'INTERNAL_ERROR';

    const errorResponse =
      process.env.NODE_ENV === 'production'
        ? {
            code: extractedCode,
            message: extractedMessage,
          }
        : {
            name: exception.name,
            message: extractedMessage,
            stack: exception.stack,
            code: extractedCode,
          };

    response.status(status).json({
      success: false,
      message: extractedMessage,
      error: errorResponse,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
