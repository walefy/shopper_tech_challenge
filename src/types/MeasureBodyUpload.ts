import type { MeteringType } from '@prisma/client';

export type MeasureBodyUpload = {
  image: string,
  customerCode: string,
  measureDatetime: Date,
  measureType: MeteringType
};
