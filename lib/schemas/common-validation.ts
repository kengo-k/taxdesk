import { z } from 'zod'

// 共通で使用する基本スキーマ
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

export const accountCodeSchema = z.string().length(3, {
  message: '科目コードは3桁である必要があります',
})

export const noteSchema = z.string().nullable()

// 年度内の日付かどうかをチェックする共通関数
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

// 日付のフィールドバリデーション（共通）
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

// 単一フィールドのバリデーションヘルパー（共通）
export function validateSingleField(
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

// フィールド名の表示用変換（共通）
export const getFieldDisplayName = (field: string): string => {
  const fieldNames: Record<string, string> = {
    date: '日付',
    karikata_cd: '借方科目',
    kasikata_cd: '貸方科目',
    other_cd: '相手科目',
    ledger_cd: '元帳科目',
    karikata_value: '借方金額',
    kasikata_value: '貸方金額',
    note: '摘要',
    checked: '確認状態',
  }
  return fieldNames[field] || field
}