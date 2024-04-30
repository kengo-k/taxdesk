import { DateTime } from 'luxon'
import * as z from 'zod'

import { Prisma } from '@prisma/client'

import { SaimokuSearchResponse } from '@/models/master'
import { PagingRequest } from '@/models/paging'

export const LedgerCreateRequestSchema = z
  .object({
    nendo: z.string(),
    ledger_cd: z
      .string()
      .length(3, 'ledger cd must be exactly 3 characters long.'),
    date: z.string(),
    karikata_value: z.string(),
    kasikata_value: z.string(),
    note: z.string(),
    other_cd: z.string(),
  })
  .transform((data) => ({
    ...data,
    karikata_value:
      data.karikata_value === '' ? null : Number(data.karikata_value),
    kasikata_value:
      data.kasikata_value === '' ? null : Number(data.kasikata_value),
    note: data.note === '' ? null : data.note,
  }))
  .refine(
    (data) => {
      const { karikata_value, kasikata_value } = data
      const isKarikataNull = karikata_value === null
      const isKasikataNull = kasikata_value === null
      return (
        (isKarikataNull && !isKasikataNull) ||
        (!isKarikataNull && isKasikataNull)
      )
    },
    {
      message:
        'Either karikata_value or kasikata_value must be a number, and the other must be null.',
      //path: ['karikata_value'],
    },
  )

// export const LedgerCreateRequestSchema = z.preprocess(
//   (data: any) => {
//     data.karikata_value = 100
//     data.kasikata_value = null
//     return data
//   },
//   z
//     .object({
//       nendo: z.string(),
//       date: z.string(),
//       ledger_cd: z.string(),
//       other_cd: z.string(),
//       karikata_value: z.number().nullable(),
//       kasikata_value: z.number().nullable(),
//       note: z.string().nullable(),
//     })
//     .refine(
//       (data) => {
//         console.log('refine!!!', data)
//         return (
//           (data.karikata_value === null && data.kasikata_value !== null) ||
//           (data.karikata_value !== null && data.kasikata_value === null)
//         )
//       },
//       {
//         message:
//           'Either "karikata_value" or "kasikata_value" must be defined, but not both',
//         path: ['karikata_value', 'kasikata_value'],
//       },
//     ),
// )

// export const LedgerCreateRequestSchema = z
//   .object({
//     nendo: z.string(),
//     date: z.string(),
//     ledger_cd: z.string(),
//     other_cd: z.string(),
//     karikata_value: z.number().nullable(),
//     kasikata_value: z.number().nullable(),
//     note: z.string().nullable(),
//   })
//   .refine(
//     (data) =>
//       (data.karikata_value !== null && data.kasikata_value === null) ||
//       (data.karikata_value === null && data.kasikata_value !== null),
//     {
//       message:
//         'Either "karikata_value" or "kasikata_value" must be defined, but not both',
//       path: ['karikata_value', 'kasikata_value'],
//     },
//   )

export type LedgerCreateRequestForm = z.input<typeof LedgerCreateRequestSchema>
export type LedgerCreateRequest = z.infer<typeof LedgerCreateRequestSchema>

export function isValidLedgerCreateRequest(
  data: unknown,
):
  | { success: true; data: LedgerCreateRequest }
  | { success: false; error: z.ZodError } {
  return LedgerCreateRequestSchema.safeParse(data)
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

export function toJournalCreateInput(
  condition: LedgerCreateRequest,
  saimokuDetail: SaimokuSearchResponse,
): Prisma.journalsCreateInput {
  let value: number
  if (condition.karikata_value === null && condition.kasikata_value === null) {
    throw new Error()
  }
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
  const now = DateTime.local().toISO()
  const entity = {
    date: condition.date,
    nendo: condition.nendo,
    note: condition.note,
    karikata_cd,
    karikata_value: value,
    kasikata_cd,
    kasikata_value: value,
    checked: '0',
    created_at: now,
    updated_at: now,
  }

  return entity
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

export type LedgerListInputErrors = Map<string, LedgerListInputErrorItem>
