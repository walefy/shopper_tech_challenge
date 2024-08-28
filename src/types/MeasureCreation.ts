import type { Measure } from '@prisma/client';

export type MeasureCreation = Omit<Measure, 'measureUuid' | 'hasConfirmed'>;
