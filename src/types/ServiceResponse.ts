import { HttpStatus } from '../enums/HttpStatus';

export type PayloadErr = {
  message: string
};

export type ServiceResponse<T> = {
  status: typeof HttpStatus[keyof typeof HttpStatus];
  payload: T | PayloadErr;
};
