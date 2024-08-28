import { z } from 'zod';

export const updateMeterValueSchema = z.object({
  measureUuid: z.string(),
  confirmedValue: z.number(),
});
