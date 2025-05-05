import { z } from 'zod'

import { ApiError, ApiErrorType, toDetails } from '@/lib/api-error'
import { KAMOKU_BUNRUI_TYPE } from '@/lib/constants/kamoku-bunrui'
import { getSaimokuDetail } from '@/lib/services/masters/get-saimoku-detail'
import { Connection } from '@/lib/types'

const createLedgerRequestSchema = z
  .object({
    nendo: z.string(),
    date: z.string(),
    ledger_cd: z.string().length(3),
    karikata_value: z.number().optional(),
    counter_cd: z.string().length(3),
    kasikata_value: z.number().optional(),
    note: z.string().nullable(),
    checked: z.string(),
  })
  .superRefine((data, ctx) => {
    // nendoの形式チェック
    if (!/^\d{4}$/.test(data.nendo)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '年度は4桁の数字である必要があります',
        path: ['nendo'],
        params: { code: 'INVALID_NENDO_FORMAT' },
      })
      return
    }

    // 日付形式のチェック
    const dateRegex = /^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/
    if (!dateRegex.test(data.date)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '日付は有効なYYYYMMDD形式である必要があります',
        path: ['date'],
        params: { code: 'INVALID_DATE_FORMAT' },
      })
      return
    }

    const year = parseInt(data.date.substring(0, 4))
    const month = parseInt(data.date.substring(4, 6)) - 1
    const day = parseInt(data.date.substring(6, 8))

    const dateObj = new Date(year, month, day)
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month ||
      dateObj.getDate() !== day
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '日付は有効なYYYYMMDD形式である必要があります',
        path: ['date'],
        params: { code: 'INVALID_DATE_FORMAT' },
      })
      return
    }

    // 年度の範囲チェック
    const nendoYear = parseInt(data.nendo)
    const startDate = `${nendoYear}0401`
    const endDate = `${nendoYear + 1}0331`
    if (data.date < startDate || data.date > endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '日付は年度の範囲内（4/1から翌年3/31）である必要があります',
        path: ['date'],
        params: { code: 'OUT_OF_FISCAL_YEAR' },
      })
    }
  })
  .refine((data) => data.ledger_cd !== data.counter_cd, {
    message: '借方科目と貸方科目は異なる必要があります',
    path: ['counter_cd'],
    params: { code: 'SAME_ACCOUNT_CODES' },
  })
  .refine(
    (data) => {
      // 借方または貸方のどちらか一方のみが入力されていることを確認
      const hasKarikata = data.karikata_value !== undefined
      const hasKasikata = data.kasikata_value !== undefined
      return (hasKarikata && !hasKasikata) || (!hasKarikata && hasKasikata)
    },
    (data) => {
      const hasKarikata = data.karikata_value !== undefined
      const hasKasikata = data.kasikata_value !== undefined
      if (!hasKarikata && !hasKasikata) {
        return {
          message: '借方または貸方のどちらか一方を入力してください',
          path: ['karikata_value'],
          params: { code: 'MISSING_AMOUNT' },
        }
      }
      return {
        message: '借方または貸方のどちらか一方のみを入力してください',
        path: ['karikata_value'],
        params: { code: 'DUPLICATE_AMOUNT' },
      }
    },
  )

export type CreateLedgerRequest = z.infer<typeof createLedgerRequestSchema>

export async function createLedger(
  conn: Connection,
  input: CreateLedgerRequest,
): Promise<void> {
  // zodのバリデーションを実行
  const validationResult = await createLedgerRequestSchema.safeParseAsync(input)
  if (!validationResult.success) {
    throw new ApiError(
      'バリデーションエラーが発生しました',
      ApiErrorType.VALIDATION,
      toDetails(validationResult.error.errors),
    )
  }

  // 科目コードの存在チェック
  const [ledgerDetail, counterDetail] = await Promise.all([
    getSaimokuDetail(conn, { saimoku_cd: input.ledger_cd }),
    getSaimokuDetail(conn, { saimoku_cd: input.counter_cd }),
  ])

  if (!ledgerDetail) {
    throw new ApiError(
      `借方科目コード ${input.ledger_cd} は存在しません`,
      ApiErrorType.VALIDATION,
      [
        {
          code: 'INVALID_ACCOUNT_CODE',
          message: `借方科目コード ${input.ledger_cd} は存在しません`,
          path: ['ledger_cd'],
        },
      ],
    )
  }

  if (!counterDetail) {
    throw new ApiError(
      `貸方科目コード ${input.counter_cd} は存在しません`,
      ApiErrorType.VALIDATION,
      [
        {
          code: 'INVALID_ACCOUNT_CODE',
          message: `貸方科目コード ${input.counter_cd} は存在しません`,
          path: ['counter_cd'],
        },
      ],
    )
  }

  const isLedgerDebit =
    ledgerDetail.kamoku_bunrui_type === KAMOKU_BUNRUI_TYPE.LEFT
  const hasKarikataValue = input.karikata_value !== undefined

  const karikata_cd = isLedgerDebit ? input.ledger_cd : input.counter_cd
  const kasikata_cd = isLedgerDebit ? input.counter_cd : input.ledger_cd
  const karikata_value = hasKarikataValue
    ? input.karikata_value!
    : input.kasikata_value!
  const kasikata_value = karikata_value

  await conn.journals.create({
    data: {
      nendo: input.nendo,
      date: input.date,
      karikata_cd,
      karikata_value,
      kasikata_cd,
      kasikata_value,
      note: input.note,
      checked: input.checked,
      created_at: new Date(),
      updated_at: new Date(),
    },
  })
}
