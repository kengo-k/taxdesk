import { inject, injectable } from 'inversify'
import 'reflect-metadata'

import { PrismaClient, journals } from '@prisma/client'

import { Factory } from '@/dicontainer'
import {
  LedgerCreateRequest,
  LedgerSearchRequest,
  LedgerSearchResponse,
  toJournalCreateInput,
} from '@/models/ledger'
import { getPagingOffset } from '@/models/paging'

export interface LedgerService {
  createLedger(req: LedgerCreateRequest): Promise<journals>
  selectLedgerList(req: LedgerSearchRequest): Promise<{
    all_count: number
    list: LedgerSearchResponse[]
  }>
}

@injectable()
export class LedgerServiceImpl implements LedgerService {
  constructor(
    @inject('PrismaClient') private prisma: PrismaClient,
    @inject('Factory') private factory: typeof Factory,
  ) {}
  public async createLedger(req: LedgerCreateRequest): Promise<journals> {
    const masterService = this.factory.getMasterService()
    const journalService = this.factory.getJournalService()

    const saimoku_detail = (
      await masterService.selectSaimokuDetail({
        saimoku_cd: req.ledger_cd,
      })
    )[0]

    const entity = toJournalCreateInput(req, saimoku_detail)
    return journalService.create(entity)
  }
  public async selectLedgerList(req: LedgerSearchRequest): Promise<{
    all_count: number
    list: LedgerSearchResponse[]
  }> {
    const masterService = this.factory.getMasterService()
    req = { ...req }
    req.month = req.month ?? 'all'
    req.page_no = req.page_no ?? 1
    req.page_size = req.page_size ?? 10

    const saimoku_detail = (
      await masterService.selectSaimokuDetail({
        saimoku_cd: req.ledger_cd,
      })
    )[0]

    const rows = await this.prisma.$queryRaw<any[]>`
      select
        *,
        cast(count(*) over (partition by 1) as integer) as all_count
      from
        (
          select
            j.id as journal_id,
            j.nendo,
            j.date,
            j.other_cd,
            j.karikata_cd,
            j.karikata_value,
            j.kasikata_cd,
            j.kasikata_value,
            cast(sum(
              case
                when
                  j.karikata_cd = ${req.ledger_cd}
                then
                  j.karikata_value else 0 end
            ) over (
              order by
                j.date desc,
                j.created_at desc
              rows
                between current row and unbounded following
            ) as integer) karikata_sum,
            cast(sum(
              case
                when
                  j.kasikata_cd = ${req.ledger_cd}
                then
                  j.kasikata_value else 0 end
            ) over (
              order by
                j.date desc,
                j.created_at desc
              rows
                between current row and unbounded following
            ) as integer) kasikata_sum,
            note,
            j.created_at
          from
            (
              select
                id,
                nendo,
                date,
                karikata_cd,
                kasikata_cd,
                karikata_value,
                kasikata_value,
                case karikata_cd
                  when ${req.ledger_cd} then kasikata_cd
                  else karikata_cd
                end as other_cd,
                note,
                created_at
              from
                journals j
              where
                nendo = ${req.nendo}
                and (
                  karikata_cd = ${req.ledger_cd}
                  or kasikata_cd = ${req.ledger_cd}
                )
            ) j
        ) j2
      where
        (case when ${req.month} = 'all' then 'all' else ${req.month} end)
        = (case when ${
          req.month
        } = 'all' then 'all' else substring(j2.date, 5, 2) end)
      order by
        j2.date desc,
        j2.created_at desc
      limit ${req.page_size} offset ${getPagingOffset(req)}`

    let all_count = 0
    const ledger_list = rows.map((res) => {
      all_count = (res as any).all_count
      const sumL = res.karikata_sum
      const sumR = res.kasikata_sum
      if (saimoku_detail.kamoku_bunrui_type === 'L') {
        res.acc = sumL - sumR
        if (res.karikata_cd === req.ledger_cd) {
          res.kasikata_value = 0
        } else {
          res.karikata_value = 0
        }
      } else {
        res.acc = sumR - sumL
        if (res.karikata_cd === req.ledger_cd) {
          res.kasikata_value = 0
        } else {
          res.karikata_value = 0
        }
      }
      return res as LedgerSearchResponse
    })

    return { all_count, list: ledger_list }
  }
}
