import { getSaimokuDetail } from '@/lib/backend/services/masters/get-saimoku-detail'
import {
  PaginationRequest,
  calculateOffset,
} from '@/lib/client/utils/pagination'
import { KAMOKU_BUNRUI_TYPE } from '@/lib/constants/kamoku-bunrui'
import { Connection } from '@/lib/types'

export interface LedgerListRequest {
  ledger_cd: string
  fiscal_year: string
  month: string | null
  checked: string | null // '0'=未確認, '1'=確認済み, null=指定なし
  note: string | null // 摘要（部分一致検索）
}

export interface LedgerListItem {
  journal_id: number
  nendo: string
  date: string
  other_cd: string
  karikata_cd: string
  karikata_value: number
  kasikata_cd: string
  kasikata_value: number
  karikata_sum: number
  kasikata_sum: number
  note: string | null
  acc: number
  checked: string
}

export async function listLedgers(
  conn: Connection,
  input: LedgerListRequest,
  pagination: PaginationRequest,
): Promise<LedgerListItem[]> {
  const month = input.month
    ? input.month.length === 1
      ? `0${input.month}`
      : input.month
    : 'all'
  const checked = input.checked ? (input.checked === '0' ? '0' : '1') : 'all'
  const useNoteCondition = input.note ? 1 : 0
  const note = input.note ? `%${input.note}%` : '%%'
  const saimoku_detail = await getSaimokuDetail(conn, {
    saimoku_cd: input.ledger_cd,
  })
  if (!saimoku_detail) {
    throw new Error('Saimoku not found')
  }
  const rows = await conn.$queryRaw<any[]>`
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
            j.karikata_cd = ${input.ledger_cd}
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
            j.kasikata_cd = ${input.ledger_cd}
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
      j.checked,
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
            when ${input.ledger_cd} then kasikata_cd
            else karikata_cd
          end as other_cd,
          note,
          checked,
          created_at
        from
          journals j
        where
          nendo = ${input.fiscal_year}
          and deleted = '0'
          and (
            karikata_cd = ${input.ledger_cd}
            or kasikata_cd = ${input.ledger_cd}
          )
      ) j
    where
      (case when ${month} = 'all' then 'all' else ${month} end)
      = (case when ${month} = 'all' then 'all' else substring(j.date, 5, 2) end)
      and (case when ${checked} = 'all' then 'all' else ${checked} end)
      = (case when ${checked} = 'all' then 'all' else j.checked end)
      and (
        ${useNoteCondition} = 0 or j.note like ${note}
      )
    order by
      j.date desc,
      j.created_at desc
    limit ${pagination.pageSize} offset ${calculateOffset(pagination)}`

  return rows.map((res) => {
    const sumL = res.karikata_sum
    const sumR = res.kasikata_sum
    if (saimoku_detail.kamoku_bunrui_type === KAMOKU_BUNRUI_TYPE.LEFT) {
      res.acc = sumL - sumR
      if (res.karikata_cd === input.ledger_cd) {
        res.kasikata_value = 0
      } else {
        res.karikata_value = 0
      }
    } else {
      res.acc = sumR - sumL
      if (res.karikata_cd === input.ledger_cd) {
        res.kasikata_value = 0
      } else {
        res.karikata_value = 0
      }
    }
    return res as LedgerListItem
  })
}
