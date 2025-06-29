import { z } from 'zod'

import { ApiError, ApiErrorType, toDetails } from '@/lib/backend/api-error'
import { getSaimokuDetail } from '@/lib/backend/services/masters/get-saimoku-detail'
import { Connection } from '@/lib/types'

const createJournalRequestSchema = z
  .object({
    nendo: z.string(),
    date: z.string(),
    debitAccount: z.string().length(3),
    debitAmount: z.number(),
    creditAccount: z.string().length(3),
    creditAmount: z.number(),
    description: z.string(),
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

    // 金額の妥当性チェック
    if (data.debitAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '借方金額は正の値である必要があります',
        path: ['debitAmount'],
        params: { code: 'INVALID_DEBIT_AMOUNT' },
      })
    }

    if (data.creditAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '貸方金額は正の値である必要があります',
        path: ['creditAmount'],
        params: { code: 'INVALID_CREDIT_AMOUNT' },
      })
    }

    if (data.debitAmount !== data.creditAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '借方金額と貸方金額が一致しません',
        path: ['creditAmount'],
        params: { code: 'AMOUNT_MISMATCH' },
      })
    }
  })
  .refine((data) => data.debitAccount !== data.creditAccount, {
    message: '借方科目と貸方科目は異なる必要があります',
    path: ['creditAccount'],
    params: { code: 'SAME_ACCOUNT_CODES' },
  })

export type CreateJournalRequest = z.infer<typeof createJournalRequestSchema>

export async function createJournal(
  conn: Connection,
  input: CreateJournalRequest,
): Promise<void> {
  // zodのバリデーションを実行
  const validationResult = await createJournalRequestSchema.safeParseAsync(input)
  if (!validationResult.success) {
    throw new ApiError(
      'バリデーションエラーが発生しました',
      ApiErrorType.VALIDATION,
      toDetails(validationResult.error.errors),
    )
  }

  // 科目コードの存在チェック
  const [debitDetail, creditDetail] = await Promise.all([
    getSaimokuDetail(conn, { saimoku_cd: input.debitAccount }),
    getSaimokuDetail(conn, { saimoku_cd: input.creditAccount }),
  ])

  if (!debitDetail) {
    throw new ApiError(
      `借方科目コード ${input.debitAccount} は存在しません`,
      ApiErrorType.VALIDATION,
      [
        {
          code: 'INVALID_ACCOUNT_CODE',
          message: `借方科目コード ${input.debitAccount} は存在しません`,
          path: ['debitAccount'],
        },
      ],
    )
  }

  if (!creditDetail) {
    throw new ApiError(
      `貸方科目コード ${input.creditAccount} は存在しません`,
      ApiErrorType.VALIDATION,
      [
        {
          code: 'INVALID_ACCOUNT_CODE',
          message: `貸方科目コード ${input.creditAccount} は存在しません`,
          path: ['creditAccount'],
        },
      ],
    )
  }

  // 仕訳データを作成
  await conn.journals.create({
    data: {
      nendo: input.nendo,
      date: input.date,
      karikata_cd: input.debitAccount,
      karikata_value: input.debitAmount,
      kasikata_cd: input.creditAccount,
      kasikata_value: input.creditAmount,
      note: input.description || null,
      checked: '0', // 初期状態は未確認
      deleted: '0', // 削除フラグは未削除
      created_at: new Date(),
      updated_at: new Date(),
    },
  })
}
