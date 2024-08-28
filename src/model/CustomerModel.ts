import type { CustomerCreation } from '../types/CustomerCreation';
import type { CustomerWithMeasure } from '../types/CustomerWithMeasure';
import { type Customer, Prisma, PrismaClient } from '@prisma/client';
import type { DefaultArgs } from '@prisma/client/runtime/library';

export class CustomerModel {
  private client: PrismaClient;
  private customer: Prisma.CustomerDelegate<DefaultArgs>;

  constructor(client = new PrismaClient()) {
    this.client = client;
    this.customer = this.client.customer;
  }

  public async create(data: CustomerCreation): Promise<Customer> {
    return this.customer.create({ data });
  }

  public async findById(customerCode: string): Promise<CustomerWithMeasure | null> {
    return this.customer.findUnique({ where: { customerCode }, include: { measures: true } });
  }

  public async findByIdOrCreate(customerCode: string): Promise<CustomerWithMeasure> {
    const costumer = await this.findById(customerCode);

    if (!costumer) {
      await this.create({ customerCode });
      return await this.findById(customerCode) as CustomerWithMeasure
    }
    return costumer;
  }
}
