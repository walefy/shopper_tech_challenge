import { HttpStatus } from '../enums/HttpStatus';
import { ErrorCode } from '../enums/ErrorCode.ts';

export type PayloadErr = {
  errorCode: typeof ErrorCode[keyof typeof ErrorCode];
  errorDescription: string;
};

export type ServiceResponse<T> = {
  status: typeof HttpStatus[keyof typeof HttpStatus];
  payload: T | PayloadErr;
};
