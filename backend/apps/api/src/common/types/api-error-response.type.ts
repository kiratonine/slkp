export type ApiErrorResponse = {
  statusCode: number;
  error: string;
  message: string;
  errorCode?: string;
  timestamp: string;
  path: string;
};