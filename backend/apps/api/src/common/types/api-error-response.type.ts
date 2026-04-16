import { ErrorCode } from '../enums/error-code.enum';

export type ApiErrorResponse = {
  statusCode: number;
  message: string;
  errorCode: ErrorCode;
};