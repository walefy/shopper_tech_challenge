import { z } from 'zod';

export const measureCreationSchema = z.object({
  image: z.string().base64(),
  customer_code: z.string(),
  measure_datetime: z.string().date(),
  measure_type: z.enum(['WATER', 'GAS']),
});