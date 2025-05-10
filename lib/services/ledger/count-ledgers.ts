import { ApiError, ApiErrorType } from '@/lib/api-error'
import { LedgerListRequest } from '@/lib/services/ledger/list-ledgers'
import { getSaimokuDetail } from '@/lib/services/masters/get-saimoku-detail'
import { Connection } from '@/lib/types'

export async function countLedgers(
  conn: Connection,
  input: LedgerListRequest,
): Promise<number> {
  const month = input.month
    ? input.month.length === 1
      ? `0${input.month}`
      : input.month
    : 'all'
  const saimoku_detail = await getSaimokuDetail(conn, {
    saimoku_cd: input.ledger_cd,
  })
  if (!saimoku_detail) {
    throw new ApiError('Saimoku not found', ApiErrorType.VALIDATION)
  }
  const rows = await conn.$queryRaw<any[]>`
    select
      count(*) as count
    from
      journals j
    where
      nendo = ${input.fiscal_year}
      and deleted = '0'
      and (
        karikata_cd = ${input.ledger_cd}
        or kasikata_cd = ${input.ledger_cd}
      )
      and (case when ${month} = 'all' then 'all' else ${month} end)
        = (case when ${month} = 'all' then 'all' else substring(j.date, 5, 2) end)`
  return Number(rows[0].count)
}
