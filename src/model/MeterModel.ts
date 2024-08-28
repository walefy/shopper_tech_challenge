import { MeteringType, Prisma, PrismaClient, type Meter } from '@prisma/client';
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

  public async findByCustomerIdAndMonth(
    customerId: string,
    baseTimestamp: Date,
    type: MeteringType
  ): Promise<Meter | null> {
    const year = baseTimestamp.getFullYear();
    const month = baseTimestamp.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return this.meter.findFirst({
      where: {
        customerId,
        meteringType: type,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  public async findById(id: string): Promise<Meter | null> {
    return this.meter.findUnique({ where: { id } });
  }

  public async updateMeterValue(meterId: string, newValue: number): Promise<Meter> {
    return this.meter.update({
      where: { id: meterId },
      data: { metering: newValue, confirmed: true } });
  }
}
