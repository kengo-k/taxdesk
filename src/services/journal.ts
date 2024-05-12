import { inject, injectable } from 'inversify'
import 'reflect-metadata'

import { Prisma, PrismaClient, journals } from '@prisma/client'

import { Factory } from '@/dicontainer'

export interface JournalService {
  create(entity: Prisma.journalsCreateInput): Promise<journals>
  updateById(id: number, entity: Prisma.journalsUpdateInput): Promise<journals>
  deleteById(id: number): Promise<journals>
}

@injectable()
export class JournalServiceImpl implements JournalService {
  constructor(
    @inject('PrismaClient') private prisma: PrismaClient,
    @inject('Factory') private factory: typeof Factory,
  ) {}
  public async create(entity: Prisma.journalsCreateInput): Promise<journals> {
    return await this.prisma.journals.create({ data: entity })
  }
  public async updateById(
    id: number,
    entity: Prisma.journalsUpdateInput,
  ): Promise<journals> {
    const updated = await this.prisma.journals.update({
      where: { id },
      data: entity,
    })
    return updated
  }
  public async deleteById(id: number): Promise<journals> {
    const deleted = await this.prisma.journals.delete({ where: { id } })
    return deleted
  }
}
