import { withTransactionForTest } from '../../framework/test-helpers'

import { ApiError } from '@/lib/backend/api-error'
import { updateJournal } from '@/lib/backend/services/journal/update-journal'

describe('updateJournal', () => {
  it(
    'should throw ApiError when the same account code is specified for both debit and credit',
    withTransactionForTest(['list-journals'], async (tx) => {
      // 同じ科目コードを指定
      const input = {
        id: '1',
        nendo: '2024',
        debitAccount: 'A11',
        creditAccount: 'A11',
      }

      const error = await updateJournal(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('SAME_ACCOUNT_CODES')
        expect(error.details[0].path).toEqual(['creditAccount'])
      }
    }),
  )

  it(
    'should throw ApiError when a non-existent debit account code is specified',
    withTransactionForTest(['list-journals'], async (tx) => {
      // 存在しない借方科目コードを指定
      const input = {
        id: '1',
        nendo: '2024',
        debitAccount: 'XXX',
      }

      const error = await updateJournal(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('INVALID_ACCOUNT_CODE')
        expect(error.details[0].path).toEqual(['debitAccount'])
      }
    }),
  )

  it(
    'should throw ApiError when a non-existent credit account code is specified',
    withTransactionForTest(['list-journals'], async (tx) => {
      // 存在しない貸方科目コードを指定
      const input = {
        id: '1',
        nendo: '2024',
        creditAccount: 'XXX',
      }

      const error = await updateJournal(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('INVALID_ACCOUNT_CODE')
        expect(error.details[0].path).toEqual(['creditAccount'])
      }
    }),
  )

  it(
    'should throw ApiError when debit and credit amounts do not match',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '1',
        nendo: '2024',
        debitAmount: 1000,
        creditAmount: 2000,
      }

      const error = await updateJournal(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('AMOUNT_MISMATCH')
        expect(error.details[0].path).toEqual(['creditAmount'])
      }
    }),
  )

  it(
    'should throw ApiError when debit amount is zero or negative',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '1',
        nendo: '2024',
        debitAmount: 0,
      }

      const error = await updateJournal(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('INVALID_DEBIT_AMOUNT')
        expect(error.details[0].path).toEqual(['debitAmount'])
      }
    }),
  )

  it(
    'should throw ApiError when credit amount is zero or negative',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '1',
        nendo: '2024',
        creditAmount: -100,
      }

      const error = await updateJournal(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('INVALID_CREDIT_AMOUNT')
        expect(error.details[0].path).toEqual(['creditAmount'])
      }
    }),
  )

  it(
    'should throw ApiError when an invalid date format is specified',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '1',
        nendo: '2024',
        date: 'invalid',
      }

      const error = await updateJournal(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('INVALID_DATE_FORMAT')
        expect(error.details[0].path).toEqual(['date'])
      }
    }),
  )

  it(
    'should throw ApiError when a non-existent date is specified',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '1',
        nendo: '2024',
        date: '20240230', // 2024年2月30日は存在しない
      }

      const error = await updateJournal(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('INVALID_DATE_FORMAT')
        expect(error.details[0].path).toEqual(['date'])
      }
    }),
  )

  it(
    'should throw ApiError when a date outside the fiscal year range is specified',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '1',
        nendo: '2024',
        date: '20240331', // 2023年度の最終日
      }

      const error = await updateJournal(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('OUT_OF_FISCAL_YEAR')
        expect(error.details[0].path).toEqual(['date'])
      }
    }),
  )

  it(
    'should throw ApiError when nendo is not a 4-digit number',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '1',
        nendo: 'invalid',
      }

      const error = await updateJournal(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('INVALID_NENDO_FORMAT')
        expect(error.details[0].path).toEqual(['nendo'])
      }
    }),
  )

  it(
    'should return multiple errors when multiple validation errors occur',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '1',
        nendo: '2024',
        date: '20240331', // 2023年度の最終日
        debitAmount: -100, // 負の値
        creditAmount: -100, // 負の値
      }

      const error = await updateJournal(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(3)

        expect(error.details[0].code).toBe('OUT_OF_FISCAL_YEAR')
        expect(error.details[0].path).toEqual(['date'])

        expect(error.details[1].code).toBe('INVALID_DEBIT_AMOUNT')
        expect(error.details[1].path).toEqual(['debitAmount'])

        expect(error.details[2].code).toBe('INVALID_CREDIT_AMOUNT')
        expect(error.details[2].path).toEqual(['creditAmount'])
      }
    }),
  )

  it(
    'should successfully update date only',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '1',
        nendo: '2024',
        date: '20240415',
      }

      // 更新前のデータを確認
      const beforeUpdate = await tx.journals.findUnique({
        where: { id: 1 },
      })
      expect(beforeUpdate?.date).toBe('20240401')

      // 更新を実行（エラーが発生しないことを確認）
      await expect(updateJournal(tx, input)).resolves.not.toThrow()

      // 更新後のデータを確認
      const afterUpdate = await tx.journals.findUnique({
        where: { id: 1 },
      })
      expect(afterUpdate?.date).toBe('20240415')
      // 他のフィールドは変更されていないことを確認
      expect(afterUpdate?.karikata_cd).toBe(beforeUpdate?.karikata_cd)
      expect(afterUpdate?.kasikata_cd).toBe(beforeUpdate?.kasikata_cd)
      expect(afterUpdate?.karikata_value).toBe(beforeUpdate?.karikata_value)
      expect(afterUpdate?.kasikata_value).toBe(beforeUpdate?.kasikata_value)
      expect(afterUpdate?.note).toBe(beforeUpdate?.note)
      expect(afterUpdate?.updated_at).not.toEqual(beforeUpdate?.updated_at)
    }),
  )

  it(
    'should successfully update debit account only',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '2',
        nendo: '2024',
        debitAccount: 'A31',
      }

      // 更新前のデータを確認
      const beforeUpdate = await tx.journals.findUnique({
        where: { id: 2 },
      })
      expect(beforeUpdate?.karikata_cd).toBe('A11')

      // 更新を実行
      await expect(updateJournal(tx, input)).resolves.not.toThrow()

      // 更新後のデータを確認
      const afterUpdate = await tx.journals.findUnique({
        where: { id: 2 },
      })
      expect(afterUpdate?.karikata_cd).toBe('A31')
      // 他のフィールドは変更されていないことを確認
      expect(afterUpdate?.date).toBe(beforeUpdate?.date)
      expect(afterUpdate?.kasikata_cd).toBe(beforeUpdate?.kasikata_cd)
      expect(afterUpdate?.karikata_value).toBe(beforeUpdate?.karikata_value)
      expect(afterUpdate?.kasikata_value).toBe(beforeUpdate?.kasikata_value)
      expect(afterUpdate?.note).toBe(beforeUpdate?.note)
    }),
  )

  it(
    'should successfully update credit account only',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '3',
        nendo: '2024',
        creditAccount: 'A31',
      }

      // 更新前のデータを確認
      const beforeUpdate = await tx.journals.findUnique({
        where: { id: 3 },
      })
      expect(beforeUpdate?.kasikata_cd).toBe('A11')

      // 更新を実行
      await expect(updateJournal(tx, input)).resolves.not.toThrow()

      // 更新後のデータを確認
      const afterUpdate = await tx.journals.findUnique({
        where: { id: 3 },
      })
      expect(afterUpdate?.kasikata_cd).toBe('A31')
      // 他のフィールドは変更されていないことを確認
      expect(afterUpdate?.date).toBe(beforeUpdate?.date)
      expect(afterUpdate?.karikata_cd).toBe(beforeUpdate?.karikata_cd)
      expect(afterUpdate?.karikata_value).toBe(beforeUpdate?.karikata_value)
      expect(afterUpdate?.kasikata_value).toBe(beforeUpdate?.kasikata_value)
      expect(afterUpdate?.note).toBe(beforeUpdate?.note)
    }),
  )

  it(
    'should successfully update both amounts when they match',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '4',
        nendo: '2024',
        debitAmount: 300000,
        creditAmount: 300000,
      }

      // 更新前のデータを確認
      const beforeUpdate = await tx.journals.findUnique({
        where: { id: 4 },
      })
      expect(beforeUpdate?.karikata_value).toBe(200000)
      expect(beforeUpdate?.kasikata_value).toBe(200000)

      // 更新を実行
      await expect(updateJournal(tx, input)).resolves.not.toThrow()

      // 更新後のデータを確認
      const afterUpdate = await tx.journals.findUnique({
        where: { id: 4 },
      })
      expect(afterUpdate?.karikata_value).toBe(300000)
      expect(afterUpdate?.kasikata_value).toBe(300000)
      // 他のフィールドは変更されていないことを確認
      expect(afterUpdate?.date).toBe(beforeUpdate?.date)
      expect(afterUpdate?.karikata_cd).toBe(beforeUpdate?.karikata_cd)
      expect(afterUpdate?.kasikata_cd).toBe(beforeUpdate?.kasikata_cd)
      expect(afterUpdate?.note).toBe(beforeUpdate?.note)
    }),
  )

  it(
    'should successfully update description only',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '5',
        nendo: '2024',
        description: '更新されたメモ',
      }

      // 更新前のデータを確認
      const beforeUpdate = await tx.journals.findUnique({
        where: { id: 5 },
      })
      expect(beforeUpdate?.note).toBe('5月の経費')

      // 更新を実行
      await expect(updateJournal(tx, input)).resolves.not.toThrow()

      // 更新後のデータを確認
      const afterUpdate = await tx.journals.findUnique({
        where: { id: 5 },
      })
      expect(afterUpdate?.note).toBe('更新されたメモ')
      // 他のフィールドは変更されていないことを確認
      expect(afterUpdate?.date).toBe(beforeUpdate?.date)
      expect(afterUpdate?.karikata_cd).toBe(beforeUpdate?.karikata_cd)
      expect(afterUpdate?.kasikata_cd).toBe(beforeUpdate?.kasikata_cd)
      expect(afterUpdate?.karikata_value).toBe(beforeUpdate?.karikata_value)
      expect(afterUpdate?.kasikata_value).toBe(beforeUpdate?.kasikata_value)
    }),
  )

  it(
    'should successfully update multiple fields at once',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '6',
        nendo: '2024',
        date: '20240615',
        debitAccount: 'A31',
        debitAmount: 180000,
        creditAccount: 'E04',
        creditAmount: 180000,
        description: '複数フィールド更新テスト',
      }

      // 更新前のデータを確認
      const beforeUpdate = await tx.journals.findUnique({
        where: { id: 6 },
      })
      expect(beforeUpdate?.date).toBe('20240601')
      expect(beforeUpdate?.karikata_cd).toBe('A11')
      expect(beforeUpdate?.kasikata_cd).toBe('D11')

      // 更新を実行
      await expect(updateJournal(tx, input)).resolves.not.toThrow()

      // 更新後のデータを確認
      const afterUpdate = await tx.journals.findUnique({
        where: { id: 6 },
      })
      expect(afterUpdate?.date).toBe('20240615')
      expect(afterUpdate?.karikata_cd).toBe('A31')
      expect(afterUpdate?.kasikata_cd).toBe('E04')
      expect(afterUpdate?.karikata_value).toBe(180000)
      expect(afterUpdate?.kasikata_value).toBe(180000)
      expect(afterUpdate?.note).toBe('複数フィールド更新テスト')
      expect(afterUpdate?.updated_at).not.toEqual(beforeUpdate?.updated_at)
    }),
  )

  it(
    'should successfully update with partial amount (debit only)',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '7',
        nendo: '2024',
        debitAmount: 35000,
      }

      // 更新前のデータを確認
      const beforeUpdate = await tx.journals.findUnique({
        where: { id: 7 },
      })
      expect(beforeUpdate?.karikata_value).toBe(25000)

      // 更新を実行
      await expect(updateJournal(tx, input)).resolves.not.toThrow()

      // 更新後のデータを確認
      const afterUpdate = await tx.journals.findUnique({
        where: { id: 7 },
      })
      expect(afterUpdate?.karikata_value).toBe(35000)
      // 貸方金額は変更されていないことを確認
      expect(afterUpdate?.kasikata_value).toBe(beforeUpdate?.kasikata_value)
    }),
  )

  it(
    'should successfully update with partial amount (credit only)',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '8',
        nendo: '2024',
        creditAmount: 90000,
      }

      // 更新前のデータを確認
      const beforeUpdate = await tx.journals.findUnique({
        where: { id: 8 },
      })
      expect(beforeUpdate?.kasikata_value).toBe(80000)

      // 更新を実行
      await expect(updateJournal(tx, input)).resolves.not.toThrow()

      // 更新後のデータを確認
      const afterUpdate = await tx.journals.findUnique({
        where: { id: 8 },
      })
      expect(afterUpdate?.kasikata_value).toBe(90000)
      // 借方金額は変更されていないことを確認
      expect(afterUpdate?.karikata_value).toBe(beforeUpdate?.karikata_value)
    }),
  )

  it(
    'should update only the updated_at timestamp when no changes provided',
    withTransactionForTest(['list-journals'], async (tx) => {
      const input = {
        id: '9',
        nendo: '2024',
      }

      // 更新前のデータを確認
      const beforeUpdate = await tx.journals.findUnique({
        where: { id: 9 },
      })

      // 更新を実行
      await expect(updateJournal(tx, input)).resolves.not.toThrow()

      // 更新後のデータを確認
      const afterUpdate = await tx.journals.findUnique({
        where: { id: 9 },
      })

      // 全てのフィールドが同じであることを確認
      expect(afterUpdate?.date).toBe(beforeUpdate?.date)
      expect(afterUpdate?.karikata_cd).toBe(beforeUpdate?.karikata_cd)
      expect(afterUpdate?.kasikata_cd).toBe(beforeUpdate?.kasikata_cd)
      expect(afterUpdate?.karikata_value).toBe(beforeUpdate?.karikata_value)
      expect(afterUpdate?.kasikata_value).toBe(beforeUpdate?.kasikata_value)
      expect(afterUpdate?.note).toBe(beforeUpdate?.note)

      // updated_atのみ更新されていることを確認
      expect(afterUpdate?.updated_at).not.toEqual(beforeUpdate?.updated_at)
    }),
  )
})
