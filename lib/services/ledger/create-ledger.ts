import { z } from 'zod'

import { ApiError, ApiErrorType, toDetails } from '@/lib/api-error'
import { KAMOKU_BUNRUI_TYPE } from '@/lib/constants/kamoku-bunrui'
import { getSaimokuDetail } from '@/lib/services/masters/get-saimoku-detail'
import { Connection } from '@/lib/types'

const createLedgerRequestSchema = z
  .object({
    nendo: z.string().length(4),
    date: z.string().length(8),
    ledger_cd: z.string().length(3),
    karikata_value: z.number().optional(),
    counter_cd: z.string().length(3),
    kasikata_value: z.number().optional(),
    note: z.string().nullable(),
    checked: z.string(),
  })
  .refine(
    (data) => {
      // 借方または貸方のどちらか一方のみが入力されていることを確認
      const hasKarikata = data.karikata_value !== undefined
      const hasKasikata = data.kasikata_value !== undefined
      return (hasKarikata && !hasKasikata) || (!hasKarikata && hasKasikata)
    },
    {
      message: '借方または貸方のどちらか一方のみを入力してください',
      path: ['karikata_value'],
    },
  )
  .refine(
    (data) => {
      // YYYYMMDD形式のチェックと有効な日付のチェック
      const dateRegex = /^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/
      if (!dateRegex.test(data.date)) {
        return false
      }

      const year = parseInt(data.date.substring(0, 4))
      const month = parseInt(data.date.substring(4, 6)) - 1
      const day = parseInt(data.date.substring(6, 8))

      const date = new Date(year, month, day)
      return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      )
    },
    {
      message: '日付は有効なYYYYMMDD形式である必要があります',
      path: ['date'],
    },
  )
  .refine((data) => data.ledger_cd !== data.counter_cd, {
    message: '借方科目と貸方科目は異なる必要があります',
    path: ['counter_cd'],
    params: { code: 'SAME_ACCOUNT_CODES' },
  })
  .refine(
    async (data) => {
      // 年度の範囲チェック
      const year = parseInt(data.nendo)
      const startDate = `${year}0401`
      const endDate = `${year + 1}0331`
      return data.date >= startDate && data.date <= endDate
    },
    {
      message: '日付は年度の範囲内（4/1から翌年3/31）である必要があります',
      path: ['date'],
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
