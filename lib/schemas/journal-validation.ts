import { z } from 'zod'

import {
  accountCodeSchema,
  dateSchema,
  noteSchema,
  validateAccountCodeExists,
  validateDateField,
  validateSingleField,
} from './common-validation'

// 仕訳帳用の金額スキーマ（必須かつ正の値）
export const journalAmountSchema = z.number().positive({
  message: '金額は正の数値である必要があります',
})

// 仕訳帳行のバリデーションスキーマ
export const journalRowSchema = z
  .object({
    nendo: z.string(),
    date: dateSchema,
    karikata_cd: accountCodeSchema,
    kasikata_cd: accountCodeSchema,
    karikata_value: journalAmountSchema,
    kasikata_value: journalAmountSchema,
    note: noteSchema,
  })
  .refine(
    (data) => {
      // 借方科目と貸方科目は異なる必要がある
      return data.karikata_cd !== data.kasikata_cd
    },
    {
      message: '借方科目と貸方科目は異なる必要があります',
      path: ['kasikata_cd'],
    },
  )
  .refine(
    (data) => {
      // 仕訳帳特有のロジック: 借方金額と貸方金額は一致する必要がある
      return data.karikata_value === data.kasikata_value
    },
    {
      message: '借方金額と貸方金額は一致する必要があります',
      path: ['kasikata_value'],
    },
  )

// フィールド単位のバリデーション関数
export function validateJournalField(
  field: string,
  value: any,
  rowData?: Record<string, any>,
): { valid: boolean; message?: string } {
  // フィールドごとのバリデーション
  switch (field) {
    case 'date':
      return validateDateField(value, rowData)
    case 'karikata_cd':
    case 'kasikata_cd':
      if (!value || value === '') {
        return { valid: false, message: '科目コードは必須です' }
      }
      // 科目コード存在チェック（accountListがrowDataに含まれている場合）
      return validateAccountCodeExists(value, rowData?.accountList)
    case 'karikata_value':
    case 'kasikata_value':
      if (!value || value <= 0) {
        return { valid: false, message: '金額は正の数値である必要があります' }
      }
      return validateSingleField(journalAmountSchema, value)
    case 'note':
      return validateSingleField(noteSchema, value)
    default:
      return { valid: true }
  }
}

// 行全体のバリデーション関数
export function validateJournalRow(rowData: Record<string, any>): {
  valid: boolean
  errors: Record<string, string>
} {
  try {
    const errors: Record<string, string> = {}

    // 1. 個別フィールドバリデーション（年度範囲チェックを含む）
    const fieldsToValidate = [
      'date',
      'karikata_cd',
      'kasikata_cd',
      'karikata_value',
      'kasikata_value',
      'note',
    ]

    for (const field of fieldsToValidate) {
      const fieldValidation = validateJournalField(
        field,
        rowData[field],
        rowData,
      )
      if (!fieldValidation.valid && fieldValidation.message) {
        errors[field] = fieldValidation.message
      }
    }

    // 2. Zodスキーマによる構造的バリデーション（借方貸方の一致など）
    const result = journalRowSchema.safeParse(rowData)
    if (!result.success) {
      result.error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (path && !errors[path]) {
          // 個別バリデーションで既にエラーがある場合は上書きしない
          errors[path] = err.message
        }
      })
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    }
  } catch (error) {
    console.error('バリデーション中にエラーが発生:', error)
    return {
      valid: false,
      errors: { _general: '検証中にエラーが発生しました' },
    }
  }
}

// validateSingleField は common-validation から import済み
