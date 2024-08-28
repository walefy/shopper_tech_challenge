import type { MeasureType } from '@prisma/client';

export type MeasureBodyUpload = {
  image: string,
  customerCode: string,
  measureDatetime: Date,
  measureType: MeasureType
};
