import { Prisma, PrismaClient, type Meter } from '@prisma/client';
import type { MeterCreation } from '../types/MeterCreation';
import type { DefaultArgs } from '@prisma/client/runtime/library';

export class MeterModel {
  private client: PrismaClient;
  private meter: Prisma.MeterDelegate<DefaultArgs>;

  constructor(client = new PrismaClient()) {
    this.client = client;
    this.meter = this.client.meter;
  }

  public async create(data: MeterCreation): Promise<Meter> {
    return this.meter.create({ data });
  }
}
