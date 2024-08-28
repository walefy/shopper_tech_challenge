import type { Customer, Measure } from '@prisma/client'

export type CustomerWithMeasure = Customer & { measures: Measure[] };
