import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../types/api-error-response.type';

type HttpExceptionResponseBody =
  | string
  | {
      statusCode?: number;
      message?: string | string[];
      error?: string;
      errorCode?: string;
    };

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const defaultStatusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    const defaultError = 'Internal Server Error';
    const defaultMessage = 'Internal server error';

    let statusCode = defaultStatusCode;
    let error = defaultError;
    let message = defaultMessage;
    let errorCode: string | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse() as HttpExceptionResponseBody;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = this.getHttpErrorName(statusCode);
      } else {
        const responseMessage = exceptionResponse.message;
        const responseError = exceptionResponse.error;
        const responseErrorCode = exceptionResponse.errorCode;

        if (Array.isArray(responseMessage)) {
          message = responseMessage.join(', ');
        } else if (typeof responseMessage === 'string') {
          message = responseMessage;
        } else {
          message = exception.message;
        }

        error =
          typeof responseError === 'string'
            ? responseError
            : this.getHttpErrorName(statusCode);

        if (typeof responseErrorCode === 'string') {
          errorCode = responseErrorCode;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const responseBody: ApiErrorResponse = {
      statusCode,
      error,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(responseBody);
  }

  private getHttpErrorName(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 409:
        return 'Conflict';
      case 500:
      default:
        return 'Internal Server Error';
    }
  }
}