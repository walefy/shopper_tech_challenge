import type { CustomerCreation } from '../types/CustomerCreation';
import type { CustomerWithMeters } from '../types/CustomerWithMeters';
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

  public async findById(id: string): Promise<CustomerWithMeters | null> {
    return this.customer.findUnique({ where: { id }, include: { meters: true } });
  }

  public async findByIdOrCreate(id: string): Promise<CustomerWithMeters> {
    const costumer = await this.findById(id);

    if (!costumer) {
      await this.create({ id });
      return await this.findById(id) as CustomerWithMeters
    }
    return costumer;
  }
}
