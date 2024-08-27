import type { MeteringType } from '@prisma/client';

export type MeasureBodyUpload = {
  image: string,
  customer_code: string,
  measure_datetime: Date,
  measure_type: MeteringType
};
