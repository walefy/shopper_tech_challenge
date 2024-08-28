import { z } from 'zod';

export const measureCreationSchema = z.object({
  image: z.string().base64(),
  customerCode: z.string(),
  measureDatetime: z.date(),
  measureType: z.enum(['WATER', 'GAS']),
});