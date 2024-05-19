import { inject, injectable } from 'inversify'
import 'reflect-metadata'

import { PrismaClient, kamoku_masters, nendo_masters } from '@prisma/client'

import {
  SaimokuSearchRequest,
  SaimokuSearchResponse,
  SaimokuWithSummary,
} from '@/models/master'

export interface MasterService {
  selectNendoList(): Promise<nendo_masters[]>
  selectKamokuList(): Promise<kamoku_masters[]>
  selectSaimokuList(nendo: string | null): Promise<SaimokuWithSummary[]>
  selectSaimokuDetail(
    condition: SaimokuSearchRequest,
  ): Promise<SaimokuSearchResponse[]>
}

@injectable()
export class MasterServiceImpl implements MasterService {
  constructor(@inject('PrismaClient') private prisma: PrismaClient) {}
  public async selectNendoList(): Promise<nendo_masters[]> {
    return await this.prisma.nendo_masters.findMany({
      orderBy: {
        nendo: 'desc',
      },
    })
  }

  public async selectKamokuList(): Promise<kamoku_masters[]> {
    return await this.prisma.kamoku_masters.findMany({
      orderBy: {
        kamoku_cd: 'asc',
      },
    })
  }

  public async selectSaimokuList(
    nendo: string | null,
  ): Promise<SaimokuWithSummary[]> {
    const saimoku_list = await this.prisma.$queryRaw<SaimokuWithSummary[]>`
    select
      min(id) as id,
      min(kamoku_cd) as kamoku_cd,
      min(kamoku_bunrui_type) as kamoku_bunrui_type,
      saimoku_cd,
      min(saimoku_full_name) as saimoku_full_name,
      min(saimoku_ryaku_name) as saimoku_ryaku_name,
      min(saimoku_kana_name) as saimoku_kana_name,
      count(journal_id)::integer as count
    from
      (
        select
          s.*,
          kb.kamoku_bunrui_type,
          j.id as journal_id
        from
          saimoku_masters s
            left join kamoku_masters k on
              s.kamoku_cd = k.kamoku_cd
            left join kamoku_bunrui_masters kb on
              k.kamoku_bunrui_cd = kb.kamoku_bunrui_cd
            left join journals j on
              (s.saimoku_cd = j.karikata_cd or s.saimoku_cd = j.kasikata_cd)
              and j.nendo = ${nendo ?? '-'}
      )
    group by
      saimoku_cd
    order by
      saimoku_cd`
    return saimoku_list
  }

  public async selectSaimokuDetail(
    condition: SaimokuSearchRequest,
  ): Promise<SaimokuSearchResponse[]> {
    const ledger_list = await this.prisma.$queryRaw<SaimokuSearchResponse[]>`
    select
      k.kamoku_cd,
      s.saimoku_cd,
      b.kamoku_bunrui_type
    from
      saimoku_masters s
        inner join kamoku_masters k on
          k.kamoku_cd = s.kamoku_cd
        inner join kamoku_bunrui_masters b on
          b.kamoku_bunrui_cd = k.kamoku_bunrui_cd
    where
      saimoku_cd = ${condition.saimoku_cd}`
    return ledger_list
  }
}
