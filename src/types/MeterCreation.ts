import type { Meter } from '@prisma/client';

export type MeterCreation = Omit<Meter, 'id'>;
