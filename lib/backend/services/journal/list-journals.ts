import {
  PaginationRequest,
  calculateOffset,
} from '@/lib/client/utils/pagination'
import { Connection } from '@/lib/types'

// 借方/貸方の定数
export const ACCOUNT_SIDE = {
  KARIKATA: 'karikata',
  KASIKATA: 'kasikata',
} as const

export type AccountSide = typeof ACCOUNT_SIDE[keyof typeof ACCOUNT_SIDE]

// 金額条件の定数
export const AMOUNT_CONDITION = {
  GTE: 'gte', // 以上
  LTE: 'lte', // 以下
} as const

export type AmountCondition = typeof AMOUNT_CONDITION[keyof typeof AMOUNT_CONDITION]

// 確認状態の定数
export const CHECKED_STATUS = {
  UNCHECKED: '0', // 未確認
  CHECKED: '1',   // 確認済み
} as const

export type CheckedStatus = typeof CHECKED_STATUS[keyof typeof CHECKED_STATUS]

export interface JournalListRequest {
  fiscal_year: string
  account: string | null
  month: string | null
  accountSide: AccountSide | null
  note: string | null
  amount: string | null
  amountCondition: AmountCondition | null
  checked: CheckedStatus | null
}

export interface JournalListItem {
  id: string
  date: string
  karikata_cd: string
  karikata_value: number
  kasikata_cd: string
  kasikata_value: number
  note: string | null
  checked: CheckedStatus
}

export async function listJournals(
  conn: Connection,
  input: JournalListRequest,
  pagination: PaginationRequest,
): Promise<JournalListItem[]> {
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

  const rows = await conn.$queryRaw<any[]>`
    select
      j.id,
      j.nendo,
      j.date,
      j.karikata_cd,
      j.karikata_value,
      j.kasikata_cd,
      j.kasikata_value,
      j.note,
      j.checked,
      j.created_at
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
        or (${accountSide} = ${ACCOUNT_SIDE.KARIKATA} and j.karikata_cd = ${account})
        or (${accountSide} = ${ACCOUNT_SIDE.KASIKATA} and j.kasikata_cd = ${account})
      )
      and (
        ${useAmountCondition} = 0
        or (${amountCondition} = ${AMOUNT_CONDITION.GTE} and (j.karikata_value >= ${amount} or j.kasikata_value >= ${amount}))
        or (${amountCondition} = ${AMOUNT_CONDITION.LTE} and (j.karikata_value <= ${amount} or j.kasikata_value <= ${amount}))
      )
    order by
      j.date desc,
      j.created_at desc
    limit ${pagination.pageSize} offset ${calculateOffset(pagination)}`

  return rows.map((row) => ({
    id: row.id.toString(),
    date: row.date,
    karikata_cd: row.karikata_cd,
    karikata_value: row.karikata_value,
    kasikata_cd: row.kasikata_cd,
    kasikata_value: row.kasikata_value,
    note: row.note,
    checked: row.checked as CheckedStatus,
  }))
}