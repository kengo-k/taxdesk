import { z } from 'zod'

import { ApiError, ApiErrorType, toDetails } from '@/lib/backend/api-error'
import { getSaimokuDetail } from '@/lib/backend/services/masters/get-saimoku-detail'
import { Connection } from '@/lib/types'

const updateJournalRequestSchema = z
  .object({
    id: z.string(),
    nendo: z.string(),
    date: z.string().optional(),
    debitAccount: z.string().length(3).optional(),
    debitAmount: z.number().optional(),
    creditAccount: z.string().length(3).optional(),
    creditAmount: z.number().optional(),
    description: z.string().optional(),
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

    // 日付の形式チェック（指定された場合のみ）
    if (data.date) {
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
    }

    // 金額の妥当性チェック（指定された場合のみ）
    if (data.debitAmount !== undefined && data.debitAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '借方金額は正の値である必要があります',
        path: ['debitAmount'],
        params: { code: 'INVALID_DEBIT_AMOUNT' },
      })
    }

    if (data.creditAmount !== undefined && data.creditAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '貸方金額は正の値である必要があります',
        path: ['creditAmount'],
        params: { code: 'INVALID_CREDIT_AMOUNT' },
      })
    }

    // 借方・貸方金額が両方指定されている場合は一致する必要がある
    if (data.debitAmount !== undefined && data.creditAmount !== undefined) {
      if (data.debitAmount !== data.creditAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '借方金額と貸方金額が一致しません',
          path: ['creditAmount'],
          params: { code: 'AMOUNT_MISMATCH' },
        })
      }
    }
  })
  .refine(
    (data) => {
      // 借方科目と貸方科目が両方指定されている場合は異なる必要がある
      if (data.debitAccount && data.creditAccount) {
        return data.debitAccount !== data.creditAccount
      }
      return true
    },
    {
      message: '借方科目と貸方科目は異なる必要があります',
      path: ['creditAccount'],
      params: { code: 'SAME_ACCOUNT_CODES' },
    },
  )

export type UpdateJournalRequest = z.infer<typeof updateJournalRequestSchema>

export async function updateJournal(
  conn: Connection,
  input: UpdateJournalRequest,
): Promise<void> {
  // zodのバリデーションを実行
  const validationResult =
    await updateJournalRequestSchema.safeParseAsync(input)
  if (!validationResult.success) {
    throw new ApiError(
      'バリデーションエラーが発生しました',
      ApiErrorType.VALIDATION,
      toDetails(validationResult.error.errors),
    )
  }

  // 科目コードの存在チェック（指定された場合のみ）
  const validationPromises = []

  if (input.debitAccount) {
    validationPromises.push(
      getSaimokuDetail(conn, { saimoku_cd: input.debitAccount }).then(
        (detail) => ({ type: 'debit', detail }),
      ),
    )
  }

  if (input.creditAccount) {
    validationPromises.push(
      getSaimokuDetail(conn, { saimoku_cd: input.creditAccount }).then(
        (detail) => ({ type: 'credit', detail }),
      ),
    )
  }

  if (validationPromises.length > 0) {
    const results = await Promise.all(validationPromises)

    for (const result of results) {
      if (!result.detail) {
        const accountCode =
          result.type === 'debit' ? input.debitAccount : input.creditAccount
        const fieldName =
          result.type === 'debit' ? 'debitAccount' : 'creditAccount'
        const accountName = result.type === 'debit' ? '借方' : '貸方'

        throw new ApiError(
          `${accountName}科目コード ${accountCode} は存在しません`,
          ApiErrorType.VALIDATION,
          [
            {
              code: 'INVALID_ACCOUNT_CODE',
              message: `${accountName}科目コード ${accountCode} は存在しません`,
              path: [fieldName],
            },
          ],
        )
      }
    }
  }

  // 更新データを構築
  const updateData: any = {
    updated_at: new Date(),
  }

  if (input.date !== undefined) updateData.date = input.date
  if (input.debitAccount !== undefined)
    updateData.karikata_cd = input.debitAccount
  if (input.debitAmount !== undefined)
    updateData.karikata_value = input.debitAmount
  if (input.creditAccount !== undefined)
    updateData.kasikata_cd = input.creditAccount
  if (input.creditAmount !== undefined)
    updateData.kasikata_value = input.creditAmount
  if (input.description !== undefined) updateData.note = input.description

  // 仕訳データを更新
  await conn.journals.update({
    where: {
      id: parseInt(input.id, 10),
      nendo: input.nendo,
      deleted: '0', // 削除されていない仕訳のみ
    },
    data: updateData,
  })
}
