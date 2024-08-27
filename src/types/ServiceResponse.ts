import { HttpStatus } from '../enums/HttpStatus';
import { ErrorCode } from '../enums/ErrorCode.ts';

export type PayloadErr = {
  error_code: typeof ErrorCode[keyof typeof ErrorCode];
  error_description: string;
};

export type ServiceResponse<T> = {
  status: typeof HttpStatus[keyof typeof HttpStatus];
  payload: T | PayloadErr;
};
