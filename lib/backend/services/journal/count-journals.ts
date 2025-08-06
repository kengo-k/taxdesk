import { Connection } from '@/lib/types'

import { JournalListRequest } from './list-journals'

export async function countJournals(
  conn: Connection,
  input: JournalListRequest,
): Promise<number> {
  // 月の条件処理（台帳と同様）
  const month = input.month
    ? input.month.length === 1
      ? `0${input.month}`
      : input.month
    : 'all'

  // 確認状態の条件処理
  const checked = input.checked ? input.checked : 'all'

  // 摘要の条件処理
  const useNoteCondition = input.note ? 1 : 0
  const note = input.note ? `%${input.note}%` : '%%'

  // 勘定科目の条件処理
  const useAccountCondition = input.account ? 1 : 0
  const account = input.account ? input.account : ''

  // 借方/貸方の条件処理
  const useAccountSideCondition = input.accountSide ? 1 : 0
  const accountSide = input.accountSide ? input.accountSide : ''

  // 金額の条件処理
  const useAmountCondition = input.amount && input.amountCondition ? 1 : 0
  const amount = input.amount ? parseFloat(input.amount) : 0
  const amountCondition = input.amountCondition ? input.amountCondition : ''

  const rows = await conn.$queryRaw<{ count: bigint }[]>`
    select
      count(*) as count
    from
      journals j
    where
      j.nendo = ${input.fiscal_year}
      and j.deleted = '0'
      and (case when ${month} = 'all' then 'all' else ${month} end)
      = (case when ${month} = 'all' then 'all' else substring(j.date, 5, 2) end)
      and (case when ${checked} = 'all' then 'all' else ${checked} end)
      = (case when ${checked} = 'all' then 'all' else j.checked end)
      and (
        ${useNoteCondition} = 0 or j.note like ${note}
      )
      and (
        ${useAccountCondition} = 0
        or j.karikata_cd = ${account}
        or j.kasikata_cd = ${account}
      )
      and (
        ${useAccountSideCondition} = 0
        or (${accountSide} = 'karikata' and j.karikata_cd = ${account})
        or (${accountSide} = 'kasikata' and j.kasikata_cd = ${account})
      )
      and (
        ${useAmountCondition} = 0
        or (${amountCondition} = 'gte' and (j.karikata_value >= ${amount} or j.kasikata_value >= ${amount}))
        or (${amountCondition} = 'lte' and (j.karikata_value <= ${amount} or j.kasikata_value <= ${amount}))
      )`

  return Number(rows[0].count)
}
