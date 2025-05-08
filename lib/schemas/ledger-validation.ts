import { z } from 'zod'

// 個別フィールドのバリデーションスキーマ
export const dateSchema = z.string().refine(
  (value) => {
    // 日付形式のチェック
    const dateRegex = /^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/
    if (!dateRegex.test(value)) return false

    const year = parseInt(value.substring(0, 4))
    const month = parseInt(value.substring(4, 6)) - 1
    const day = parseInt(value.substring(6, 8))

    const dateObj = new Date(year, month, day)
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month &&
      dateObj.getDate() === day
    )
  },
  {
    message: '日付は有効なYYYYMMDD形式である必要があります',
  },
)

// 年度内の日付かどうかをチェックする
export const validateDateWithinFiscalYear = (date: string, nendo: string) => {
  // nendoが無効な場合は検証をスキップ
  if (!nendo || !/^\d{4}$/.test(nendo)) return true

  const fiscalYear = parseInt(nendo)
  const fiscalYearStart = new Date(fiscalYear, 3, 1) // 4月1日
  const fiscalYearEnd = new Date(fiscalYear + 1, 2, 31) // 翌年3月31日

  // 入力された日付を解析
  const year = parseInt(date.substring(0, 4))
  const month = parseInt(date.substring(4, 6)) - 1
  const day = parseInt(date.substring(6, 8))
  const inputDate = new Date(year, month, day)

  // 年度内かチェック
  return inputDate >= fiscalYearStart && inputDate <= fiscalYearEnd
}

// 日付のフィールドバリデーション用に拡張
export function validateDateField(
  value: string,
  rowData?: Record<string, any>,
): { valid: boolean; message?: string } {
  // 基本的な日付形式のバリデーション
  const basicValidation = validateSingleField(dateSchema, value)
  if (!basicValidation.valid) {
    return basicValidation
  }

  // 年度情報がある場合は、年度範囲内かチェック
  if (rowData?.nendo) {
    const isWithinFiscalYear = validateDateWithinFiscalYear(
      value,
      rowData.nendo,
    )
    if (!isWithinFiscalYear) {
      return {
        valid: false,
        message: `日付は${rowData.nendo}年度（${rowData.nendo}年4月1日〜${parseInt(rowData.nendo) + 1}年3月31日）の範囲内である必要があります`,
      }
    }
  }

  return { valid: true }
}

export const accountCodeSchema = z.string().length(3, {
  message: '科目コードは3桁である必要があります',
})

export const amountSchema = z.number().optional()

export const noteSchema = z.string().nullable()

// 行全体のバリデーションスキーマ
export const ledgerRowSchema = z
  .object({
    journal_id: z.string().or(z.number()).optional(),
    nendo: z.string(),
    date: dateSchema,
    // 以下のフィールドは直接データに存在するか、計算される可能性がある
    karikata_cd: accountCodeSchema.optional(),
    kasikata_cd: accountCodeSchema.optional(),
    // other_cd を追加
    other_cd: accountCodeSchema.optional(),
    ledger_cd: accountCodeSchema.optional(),
    karikata_value: amountSchema,
    kasikata_value: amountSchema,
    note: noteSchema,
  })
  .refine(
    (data) => {
      // 借方貸方コードのチェックはどちらかが存在する場合のみ行う
      if (!data.karikata_cd || !data.kasikata_cd) return true
      return data.karikata_cd !== data.kasikata_cd
    },
    {
      message: '借方科目と貸方科目は異なる必要があります',
      path: ['kasikata_cd'],
    },
  )
  .refine(
    (data) => {
      // 借方または貸方のどちらか一方のみが入力されていることを確認
      const hasKarikata =
        data.karikata_value !== undefined && data.karikata_value > 0
      const hasKasikata =
        data.kasikata_value !== undefined && data.kasikata_value > 0
      return (hasKarikata && !hasKasikata) || (!hasKarikata && hasKasikata)
    },
    (data) => {
      const hasKarikata =
        data.karikata_value !== undefined && data.karikata_value > 0
      const hasKasikata =
        data.kasikata_value !== undefined && data.kasikata_value > 0
      if (!hasKarikata && !hasKasikata) {
        return {
          message: '借方または貸方のどちらか一方を入力してください',
          path: ['karikata_value'],
        }
      }
      return {
        message: '借方または貸方のどちらか一方のみを入力してください',
        path: ['karikata_value'],
      }
    },
  )

// フィールド単位のバリデーション関数
export function validateField(
  field: string,
  value: any,
  rowData?: Record<string, any>,
): { valid: boolean; message?: string } {
  // フィールドごとのバリデーション
  switch (field) {
    case 'date':
      return validateDateField(value, rowData)
    case 'ledger_cd':
    case 'karikata_cd':
    case 'kasikata_cd':
    case 'other_cd':
      return validateSingleField(accountCodeSchema, value)
    case 'karikata_value':
    case 'kasikata_value':
      // 金額は単体では数値チェックのみ
      return validateSingleField(amountSchema, value)
    case 'note':
      return validateSingleField(noteSchema, value)
    default:
      return { valid: true }
  }
}

// 行全体のバリデーション関数
export function validateRow(rowData: Record<string, any>): {
  valid: boolean
  errors: Record<string, string>
} {
  try {
    const result = ledgerRowSchema.safeParse(rowData)
    if (result.success) {
      return { valid: true, errors: {} }
    }

    // エラーマップを構築
    const errors: Record<string, string> = {}
    result.error.errors.forEach((err) => {
      const path = err.path.join('.')
      if (path) {
        errors[path] = err.message
      }
    })

    return { valid: false, errors }
  } catch (error) {
    console.error('バリデーション中にエラーが発生:', error)
    return {
      valid: false,
      errors: { _general: '検証中にエラーが発生しました' },
    }
  }
}

// 単一フィールドのバリデーションヘルパー
function validateSingleField(
  schema: z.ZodType<any>,
  value: any,
): { valid: boolean; message?: string } {
  const result = schema.safeParse(value)
  if (result.success) {
    return { valid: true }
  }
  return {
    valid: false,
    message: result.error.errors[0]?.message || 'Invalid value',
  }
}
