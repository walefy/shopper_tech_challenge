import { z } from 'zod';

export const updateMeasureValueSchema = z.object({
  measureUuid: z.string(),
  confirmedValue: z.number(),
});
