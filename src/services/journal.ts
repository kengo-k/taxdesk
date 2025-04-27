import { inject, injectable } from 'inversify'
import 'reflect-metadata'

import { Prisma, PrismaClient, journals } from '@prisma/client'

import { Factory } from '@/dicontainer'

export interface JournalService {
  create(entity: Prisma.journalsCreateInput): Promise<journals>
  updateById(id: number, entity: Prisma.journalsUpdateInput): Promise<journals>
  deleteById(id: number): Promise<journals>
  deleteManyByIds(nendo: string, ids: number[]): Promise<Prisma.BatchPayload>
  selectCategorySummary(nendo: string, category: string): Promise<any>
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

  public async deleteManyByIds(nendo: string, ids: number[]): Promise<Prisma.BatchPayload> {
    const deleted = await this.prisma.journals.deleteMany({
      where: {
        AND: [
          { id: { in: ids } },
          { nendo: nendo }
        ]
      }
    })
    return deleted
  }

  public async selectCategorySummary(
    nendo: string,
    category: string,
  ): Promise<{}> {
    const rows = await this.prisma.$queryRaw<any[]>`
    select
      sum(case
          when karikata_kamoku_bunrui_cd = ${category}
          then karikata_value else 0
        end
      ) as karikata_kamoku_bunrui_sum,
      sum(case
          when kasikata_kamoku_bunrui_cd = ${category}
          then kasikata_value else 0
        end
      ) as kasikata_kamoku_bunrui_sum
    from
      (
        select
          kari_k.kamoku_bunrui_cd as karikata_kamoku_bunrui_cd,
          kasi_k.kamoku_bunrui_cd as kasikata_kamoku_bunrui_cd,
          karikata_value,
          kasikata_value
        from
          journals j
            left join saimoku_masters kari_s on
              kari_s.saimoku_cd = j.karikata_cd
            left join kamoku_masters kari_k on
              kari_k.kamoku_cd = kari_s.kamoku_cd
            left join saimoku_masters kasi_s on
              kasi_s.saimoku_cd = j.kasikata_cd
            left join kamoku_masters kasi_k on
              kasi_k.kamoku_cd = kasi_s.kamoku_cd
        where
          nendo = ${nendo}
      ) j2
    where
      j2.karikata_kamoku_bunrui_cd = ${category}
      or j2.kasikata_kamoku_bunrui_cd = ${category}`

    return {}
  }
}
