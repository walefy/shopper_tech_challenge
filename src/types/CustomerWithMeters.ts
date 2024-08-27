import type { Customer, Meter } from '@prisma/client'

export type CustomerWithMeters = Customer & { meters: Meter[] };
