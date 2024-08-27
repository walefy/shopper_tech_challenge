import type { ErrorAsValue } from './ErrorAsValue';

export type PayloadSuccess = {
  value: number;
};

export type GeminiInterpretImageResponse = ErrorAsValue<PayloadSuccess>;
