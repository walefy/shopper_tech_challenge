import type { ErrorAsValue } from './ErrorAsValue';

export type PayloadSuccess = {
  url: string;
};

export type PutImageResponse = ErrorAsValue<PayloadSuccess>;
