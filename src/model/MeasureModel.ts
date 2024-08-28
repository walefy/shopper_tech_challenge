import { MeasureType, Prisma, PrismaClient, type Measure } from '@prisma/client';
import type { MeasureCreation } from '../types/MeasureCreation';
import type { DefaultArgs } from '@prisma/client/runtime/library';

export class MeasureModel {
  private client: PrismaClient;
  private measure: Prisma.MeasureDelegate<DefaultArgs>;

  constructor(client = new PrismaClient()) {
    this.client = client;
    this.measure = this.client.measure;
  }

  public async create(data: MeasureCreation): Promise<Measure> {
    return this.measure.create({ data });
  }

  public async findByCustomerIdAndMonth(
    customerId: string,
    baseTimestamp: Date,
    type: MeasureType
  ): Promise<Measure | null> {
    const year = baseTimestamp.getFullYear();
    const month = baseTimestamp.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return this.measure.findFirst({
      where: {
        customerCode: customerId,
        measureType: type,
        measureDatetime: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  public async findById(measureUuid: string): Promise<Measure | null> {
    return this.measure.findUnique({ where: { measureUuid } });
  }

  public async updateMeasureValue(measureUuid: string, newValue: number): Promise<Measure> {
    return this.measure.update({
      where: { measureUuid },
      data: { measureValue: newValue, hasConfirmed: true } });
  }

  public async findByCustomerCode(customerCode: string, measureType: string = 'ALL'): Promise<Measure[]> {
    if (measureType == 'ALL') {
      return this.measure.findMany({ where: { customerCode } });
    }

    return this.measure.findMany({ where: { customerCode, measureType: measureType as MeasureType } });
  }
}
