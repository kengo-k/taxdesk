import { DateTime } from 'luxon'
import numeral from 'numeral'
import * as z from 'zod'

import { UseFormReturnType } from '@mantine/form'
import { Prisma } from '@prisma/client'

import { SaimokuSearchResponse } from '@/models/master'
import { PagingRequest } from '@/models/paging'

export const LedgerCreateRequestSchema = z.object({
  nendo: z.string(),
  ledger_cd: z.string().length(3),
  other_cd: z.string().length(3),
  date: z.string(),
  karikata_value: z.number().nullable(),
  kasikata_value: z.number().nullable(),
  note: z.string().nullable(),
})

export type LedgerCreateRequest = z.infer<typeof LedgerCreateRequestSchema>

function day() {
  return (data: string, ctx: z.RefinementCtx) => {
    if (!data) {
      return
    }
    const value = numeral(data)
    if (value.value() == null || ![1, 2].includes(data.length)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['format'],
        message: 'Must be a two-digit number.',
      })
    }
  }
}

function date() {
  return (data: string, ctx: z.RefinementCtx) => {
    console.log('date', data)
    if (!data) {
      return
    }
    if (!/^(\d{4}\/\d{2}\/\d{2})$/.test(data)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['format'],
        message: `Must be a yyyy/mm/dd, input value=\`${data}\``,
      })
    }
  }
}

function yyyymm() {
  return (data: string, ctx: z.RefinementCtx) => {
    if (!data) {
      return
    }
    if (!/^(\d{4}\/\d{2})$/.test(data)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['format'],
        message: 'Must be a yyyy/mm.',
      })
    }
  }
}

function amount() {
  return (data: string, ctx: z.RefinementCtx) => {
    if (!data) {
      return
    }
    const value = numeral(data)
    if (value.value() == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['number'],
        message: 'Must be a number',
      })
    }
  }
}

function length(length: number) {
  return (data: string, ctx: z.RefinementCtx) => {
    if (!data) {
      return
    }
    if (data.length !== length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['length'],
        message: `Length must be ${length}`,
      })
    }
  }
}

export const LedgerCreateRequestFormSchema = z
  .object({
    nendo: z.string().regex(/^\d{4}$/),
    ledger_cd: z.string().superRefine(length(3)),
    date: z.string().superRefine(date()),
    date_yymm: z.string().superRefine(yyyymm()),
    date_dd: z.string().superRefine(day()),
    karikata_value: z.string().superRefine(amount()),
    kasikata_value: z.string().superRefine(amount()),
    note: z.string(),
    other_cd: z.string().superRefine(length(3)),
  })
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

export type LedgerCreateRequestForm = z.input<
  typeof LedgerCreateRequestFormSchema
>
export const LedgerCreateRequestForm = {
  hasError: (
    key: keyof LedgerCreateRequestForm,
    form: UseFormReturnType<LedgerCreateRequestForm>,
  ) => {
    return Object.keys(form.errors).some((error_id) => {
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

export function isValidLedgerUpdateRequest(
  data: unknown,
):
  | { success: true; data: LedgerUpdateRequest }
  | { success: false; error: z.ZodError } {
  return LedgerUpdateRequestSchema.safeParse(data)
}

export type LedgerSearchRequest = {
  nendo: string
  ledger_cd: string
  month: string | null
} & PagingRequest

export const LedgerUpdateRequestSchema = z.object({
  journal_id: z.number(),
  nendo: z.string(),
  ledger_cd: z.string().length(3),
  other_cd: z.string().length(3),
  date: z.string(),
  karikata_value: z.number().nullable(),
  kasikata_value: z.number().nullable(),
  note: z.string().nullable(),
})

export type LedgerUpdateRequest = z.infer<typeof LedgerUpdateRequestSchema>

export const LedgerUpdateRequestFormSchema = z.object({
  items: z.array(
    z
      .object({
        journal_id: z.number(),
        nendo: z.string().regex(/^\d{4}$/),
        ledger_cd: z.string().superRefine(length(3)),
        date: z.string().superRefine(date()),
        date_yymm: z.string().superRefine(yyyymm()),
        date_dd: z.string().superRefine(day()),
        karikata_value: z.string().superRefine(amount()),
        kasikata_value: z.string().superRefine(amount()),
        note: z.string(),
        other_cd: z.string().superRefine(length(3)),
        acc: z.number(),
      })
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
        } as LedgerUpdateRequest
        delete (ret as any).date_yymm
        delete (ret as any).date_dd
        delete (ret as any).acc
        return ret
      }),
  ),
})

export type LedgerUpdateRequestForm = z.input<
  typeof LedgerUpdateRequestFormSchema
>

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
  note: string | null
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

export function toJournalUpdateInput(
  condition: LedgerUpdateRequest,
  saimokuDetail: SaimokuSearchResponse,
): Prisma.journalsUpdateInput {
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
  const entity: Prisma.journalsUpdateInput = {
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
