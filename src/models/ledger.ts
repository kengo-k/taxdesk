import { JournalDate, Nendo } from './date'
import { DateTime } from 'luxon'
import numeral from 'numeral'
import * as z from 'zod'

import { UseFormReturnType } from '@mantine/form'
import { Prisma } from '@prisma/client'

import { SaimokuSearchResponse } from '@/models/master'
import { PagingRequest } from '@/models/paging'

function createAmountValidator() {
  return z.string().refine(
    (value) => {
      if (value.trim().length === 0) {
        return true
      }
      const num = numeral(value)
      return num.value() != null
    },
    { message: 'must be a number' },
  )
}

function getDateString(
  date_full: string,
  date_yymm: string,
  date_dd: string,
): string {
  let date_str = date_full
  if (date_yymm.length > 0) {
    date_str = `${date_yymm}/${date_dd}`
  }
  const date = numeral(date_str)
  return `${date.value()}`
}

export const LedgerCreateRequestSchema = z.object({
  nendo: z.string(),
  ledger_cd: z.string().length(3),
  other_cd: z.string(),
  date: z.string(),
  karikata_value: z.number().nullable(),
  kasikata_value: z.number().nullable(),
  note: z.string().nullable(),
})

export type LedgerCreateRequest = z.infer<typeof LedgerCreateRequestSchema>

export const LedgerCreateRequestFormSchema = z
  .object({
    nendo: z.string().regex(/^\d{4}$/),
    ledger_cd: z.string().length(3),
    date: z.string().regex(/^(\d{4}\/\d{2}\/\d{2})?$/),
    date_yymm: z.string().regex(/^(\d{4}\/\d{2})?$/),
    date_dd: z.string().regex(/^(\d{2})?$/),
    karikata_value: createAmountValidator(),
    kasikata_value: createAmountValidator(),
    note: z.string(),
    other_cd: z.string(),
  })
  .refine(
    (data) => {
      return (
        (data.date !== '' && data.date_yymm + data.date_dd === '') ||
        (data.date === '' && data.date_yymm + data.date_dd !== '')
      )
    },
    { message: 'invalid date', path: ['date'] },
  )
  .transform((data) => {
    const date =
      data.date !== '' ? data.date : `${data.date_yymm}/${data.date_dd}`
    const ret = {
      ...data,
      date,
      karikata_value:
        data.karikata_value === '' || data.karikata_value === null
          ? null
          : numeral(data.karikata_value).value(),
      kasikata_value:
        data.kasikata_value === '' || data.karikata_value === null
          ? null
          : numeral(data.kasikata_value).value(),
      note: data.note === '' ? null : data.note,
    } as LedgerCreateRequest
    delete (ret as any).date_full
    delete (ret as any).date_yymm
    delete (ret as any).date_dd
    return ret
  })
  .superRefine((data, ctx) => {
    const nendo = Nendo.create(data.nendo, [data.nendo])
    const issue = {
      code: z.ZodIssueCode.custom,
      path: ['date'],
    }
    const date = JournalDate.create(data.date)
    if (date == null) {
      ctx.addIssue({ ...issue, message: `invalid date: ${data.date}` })
      return
    }
    if (nendo != null && !nendo.isInNendo(date)) {
      const [start, end] = nendo.getRange('yyyy/MM/dd')
      ctx.addIssue({
        ...issue,
        message: `invalid date: ${data.date} must be in a range between ${start} and ${end}`,
      })
    }
  })
  .transform((data) => {
    return { ...data, date: data.date.replaceAll('/', '') }
  })
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
      path: ['karikata_value', 'kasikata_value'],
    },
  )

export type LedgerCreateRequestForm = z.input<
  typeof LedgerCreateRequestFormSchema
>
export const LedgerCreateRequestForm = {
  hasError: (
    key: keyof LedgerCreateRequestForm,
    form: UseFormReturnType<LedgerCreateRequestForm>,
  ) => {
    return Object.keys(form.errors).some((error_id) => {
      //console.log(`${error_id} includes ${key}= ${error_id.includes(key)}`)
      return error_id.includes(key)
    })
  },

  set: <K extends keyof LedgerCreateRequestForm>(
    key: K,
    form: UseFormReturnType<LedgerCreateRequestForm>,
    value: LedgerCreateRequestForm[K],
  ) => {
    form.setFieldValue(key, value as any)
  },
}

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

export const LedgerUpdateRequestSchema = z.object({
  items: z.array(
    z
      .object({
        journal_id: z.number(),
        nendo: z.string(),
        ledger_cd: z
          .string()
          .length(3, 'ledger cd must be exactly 3 characters long.'),
        date_full: z.string(),
        date_yymm: z.string(),
        date_dd: z.string(),
        karikata_value: createAmountValidator(),
        kasikata_value: createAmountValidator(),
        note: z.string(),
        other_cd: z.string(),
        other_cd_name: z.string(),
        acc: z.number(),
      })
      .transform((data) => {
        const ret: any = {
          ...data,
          date: getDateString(data.date_full, data.date_yymm, data.date_dd),
          karikata_value:
            data.karikata_value === ''
              ? null
              : numeral(data.karikata_value).value(),
          kasikata_value:
            data.kasikata_value === ''
              ? null
              : numeral(data.kasikata_value).value(),
          note: data.note === '' ? null : data.note,
        }
        delete ret.date_full
        delete ret.date_yymm
        delete ret.date_dd
        delete ret.other_cd_name
        delete ret.acc
        return ret
      })
      .refine(
        (data) => {
          const { karikata_value, kasikata_value } = data
          const isKarikataNull = karikata_value === null
          const isKasikataNull = kasikata_value === null
          const is_valid =
            (isKarikataNull && !isKasikataNull) ||
            (!isKarikataNull && isKasikataNull)
          return is_valid
        },
        {
          message:
            'Either karikata_value or kasikata_value must be a number, and the other must be null.',
          path: ['karikata_value', 'kasikata_value'],
        },
      ),
  ),
})

export type LedgerUpdateRequest = z.infer<typeof LedgerUpdateRequestSchema>

export type LedgerUpdateRequestForm = z.input<typeof LedgerUpdateRequestSchema>
export type LedgerUpdateRequestFormItem = ReturnType<
  () => LedgerUpdateRequestForm['items'][number]
>
export const LedgerUpdateRequestForm = {
  hasError: <K extends keyof LedgerUpdateRequestFormItem>(
    key: K,
    form: UseFormReturnType<LedgerUpdateRequestForm>,
    index: number,
  ) => {
    return Object.keys(form.errors).some((error_id) => {
      if (error_id.startsWith(`items.${index}`)) {
        return error_id.includes(key)
      }
      return false
    })
  },

  set: <K extends keyof LedgerUpdateRequestFormItem>(
    key: K,
    form: UseFormReturnType<LedgerUpdateRequestForm>,
    index: number,
    value: LedgerUpdateRequestFormItem[K],
  ) => {
    form.setFieldValue(`items.${index}.${key}`, value as any)
  },
}

// export interface LedgerUpdateRequest {
//   id: number
//   ledger_cd: string
//   other_cd: string
//   karikata_value: number | null
//   kasikata_value: number | null
// }

export interface LedgerSearchResponse {
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
