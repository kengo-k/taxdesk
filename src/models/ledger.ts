import { journals } from '@prisma/client'

import { SaimokuSearchResponse } from '@/models/master'
import { PagingRequest } from '@/models/paging'

export interface LedgerCreateRequest {
  nendo: string
  date: string
  ledger_cd: string
  other_cd: string
  karikata_value: number | null
  kasikata_value: number | null
  note?: string
}

export type LedgerSearchRequest = {
  nendo: string
  ledger_cd: string
  month: string | null
} & PagingRequest

export interface LedgerUpdateRequest {
  id: number
  ledger_cd: string
  other_cd: string
  karikata_value: number | null
  kasikata_value: number | null
}

export interface LedgerSearchResponse {
  journal_id: number
  nendo: string
  date: string
  another_cd: string
  karikata_cd: string
  karikata_value: number
  kasikata_cd: string
  kasikata_value: number
  karikata_sum: number
  kasikata_sum: number
  note: string
  acc: number
}

interface Valid {
  hasError: false
}

interface Invalid {
  hasError: true
  message: string
  targetId: Array<
    keyof Pick<
      LedgerSearchResponse,
      'date' | 'karikata_value' | 'kasikata_value' | 'another_cd'
    >
  >
}

export interface LedgerListInputErrorItem {
  date_required?: Omit<Invalid, 'hasError'>
  date_format?: Omit<Invalid, 'hasError'>
  date_month_range?: Omit<Invalid, 'hasError'>
  date_nendo_range?: Omit<Invalid, 'hasError'>
  cd_required?: Omit<Invalid, 'hasError'>
  cd_invalid?: Omit<Invalid, 'hasError'>
  kari_format?: Omit<Invalid, 'hasError'>
  kari_negative?: Omit<Invalid, 'hasError'>
  kasi_format?: Omit<Invalid, 'hasError'>
  kasi_negative?: Omit<Invalid, 'hasError'>
  value_both?: Omit<Invalid, 'hasError'>
  value_neither?: Omit<Invalid, 'hasError'>
}

export function toJournalEntity(
  condition: LedgerCreateRequest | LedgerUpdateRequest,
  saimokuDetail: SaimokuSearchResponse,
): Partial<journals> {
  let value: number
  // 金額が両方nullはありえないのでエラー
  if (condition.karikata_value === null && condition.kasikata_value === null) {
    throw new Error()
  }
  // 金額が両方設定されることはありえないのでエラー
  if (condition.karikata_value != null && condition.kasikata_value != null) {
    throw new Error()
  }
  if (condition.karikata_value != null) {
    value = condition.karikata_value
  } else {
    value = condition.kasikata_value!
  }
  let karikata_cd: string
  let kasikata_cd: string
  if (saimokuDetail.kamoku_bunrui_type === 'L') {
    if (condition.karikata_value != null) {
      karikata_cd = condition.ledger_cd
      kasikata_cd = condition.other_cd
    } else {
      karikata_cd = condition.other_cd
      kasikata_cd = condition.ledger_cd
    }
  } else {
    if (condition.kasikata_value != null) {
      karikata_cd = condition.other_cd
      kasikata_cd = condition.ledger_cd
    } else {
      karikata_cd = condition.ledger_cd
      kasikata_cd = condition.other_cd
    }
  }
  const entityValue: Partial<journals> = {
    karikata_cd,
    karikata_value: value,
    kasikata_cd,
    kasikata_value: value,
    checked: '0',
  }
  if ('id' in condition) {
    entityValue.id = condition.id
  } else {
    if (condition.nendo != null) {
      entityValue.nendo = condition.nendo
    }
    if (condition.date != null) {
      entityValue.date = condition.date
    }
    if (condition.note != null) {
      entityValue.note = condition.note
    }
  }
  return entityValue
}

export type LedgerListInputErrors = Map<string, LedgerListInputErrorItem>
