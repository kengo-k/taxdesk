import { withTransactionForTest } from '../../framework/test-helpers'

import { ApiError } from '@/lib/backend/api-error'
import { countJournals } from '@/lib/backend/services/journal/count-journals'
import { createJournal } from '@/lib/backend/services/journal/create-journal'

describe('createJournal', () => {
  it(
    'should throw ApiError when the same account code is specified',
    withTransactionForTest([], async (tx) => {
      // 同じ科目コードを指定
      const input = {
        nendo: '2021',
        date: '20210401',
        debitAccount: 'A11',
        debitAmount: 1000,
        creditAccount: 'A11',
        creditAmount: 1000,
        description: 'test',
      }

      const error = await createJournal(tx, input).catch((e) => e)
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
    withTransactionForTest([], async (tx) => {
      // 存在しない借方科目コードを指定
      const input = {
        nendo: '2021',
        date: '20210401',
        debitAccount: 'XXX',
        debitAmount: 1000,
        creditAccount: 'E04',
        creditAmount: 1000,
        description: 'test',
      }

      const error = await createJournal(tx, input).catch((e) => e)
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
    withTransactionForTest([], async (tx) => {
      // 存在しない貸方科目コードを指定
      const input = {
        nendo: '2021',
        date: '20210401',
        debitAccount: 'A11',
        debitAmount: 1000,
        creditAccount: 'XXX',
        creditAmount: 1000,
        description: 'test',
      }

      const error = await createJournal(tx, input).catch((e) => e)
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
    withTransactionForTest([], async (tx) => {
      const input = {
        nendo: '2021',
        date: '20210401',
        debitAccount: 'A11',
        debitAmount: 1000,
        creditAccount: 'E04',
        creditAmount: 2000,
        description: 'test',
      }

      const error = await createJournal(tx, input).catch((e) => e)
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
    withTransactionForTest([], async (tx) => {
      const input = {
        nendo: '2021',
        date: '20210401',
        debitAccount: 'A11',
        debitAmount: 0,
        creditAccount: 'E04',
        creditAmount: 0,
        description: 'test',
      }

      const error = await createJournal(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(2)

        expect(error.details[0].code).toBe('INVALID_DEBIT_AMOUNT')
        expect(error.details[0].path).toEqual(['debitAmount'])

        expect(error.details[1].code).toBe('INVALID_CREDIT_AMOUNT')
        expect(error.details[1].path).toEqual(['creditAmount'])
      }
    }),
  )

  it(
    'should throw ApiError when an invalid date format is specified',
    withTransactionForTest([], async (tx) => {
      const input = {
        nendo: '2021',
        date: 'invalid',
        debitAccount: 'A11',
        debitAmount: 1000,
        creditAccount: 'E04',
        creditAmount: 1000,
        description: 'test',
      }

      const error = await createJournal(tx, input).catch((e) => e)
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
    withTransactionForTest([], async (tx) => {
      const input = {
        nendo: '2020',
        date: '20210230',
        debitAccount: 'A11',
        debitAmount: 1000,
        creditAccount: 'E04',
        creditAmount: 1000,
        description: 'test',
      }

      const error = await createJournal(tx, input).catch((e) => e)
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
    withTransactionForTest([], async (tx) => {
      const input = {
        nendo: '2021',
        date: '20210331', // 2020年度の最終日
        debitAccount: 'A11',
        debitAmount: 1000,
        creditAccount: 'E04',
        creditAmount: 1000,
        description: 'test',
      }

      const error = await createJournal(tx, input).catch((e) => e)
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
    withTransactionForTest([], async (tx) => {
      const input = {
        nendo: 'invalid',
        date: '20210401',
        debitAccount: 'A11',
        debitAmount: 1000,
        creditAccount: 'E04',
        creditAmount: 1000,
        description: 'test',
      }

      const error = await createJournal(tx, input).catch((e) => e)
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
    withTransactionForTest([], async (tx) => {
      const input = {
        nendo: '2021',
        date: '20210331', // 2020年度の最終日
        debitAccount: 'A11',
        debitAmount: -100, // 負の値
        creditAccount: 'E04',
        creditAmount: -100, // 負の値
        description: 'test',
      }

      const error = await createJournal(tx, input).catch((e) => e)
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
    'should create a journal entry and return the correct count',
    withTransactionForTest([], async (tx) => {
      const input = {
        nendo: '2021',
        date: '20210401',
        debitAccount: 'A11',
        debitAmount: 1000,
        creditAccount: 'E04',
        creditAmount: 1000,
        description: 'test journal entry',
      }

      // 登録前の件数を確認
      const initialCount = await countJournals(tx, {
        fiscal_year: '2021',
        account: null,
        month: null,
        accountSide: null,
        note: null,
        amount: null,
        amountCondition: null,
        checked: null,
      })

      // 登録を実行
      await createJournal(tx, input)

      // 登録後の件数を確認
      const finalCount = await countJournals(tx, {
        fiscal_year: '2021',
        account: null,
        month: null,
        accountSide: null,
        note: null,
        amount: null,
        amountCondition: null,
        checked: null,
      })
      expect(finalCount).toBe(initialCount + 1)
    }),
  )

  it(
    'should create a journal entry with valid account codes and verify its properties',
    withTransactionForTest([], async (tx) => {
      const input = {
        nendo: '2021',
        date: '20210401',
        debitAccount: 'A11',
        debitAmount: 1500,
        creditAccount: 'E04',
        creditAmount: 1500,
        description: 'Valid journal entry test',
      }

      // 登録を実行（エラーが発生しないことを確認）
      await expect(createJournal(tx, input)).resolves.not.toThrow()

      // データベースから作成されたレコードを確認
      const journals = await tx.journals.findMany({
        where: {
          nendo: '2021',
          date: '20210401',
          karikata_cd: 'A11',
          kasikata_cd: 'E04',
          deleted: '0',
        },
      })

      expect(journals).toHaveLength(1)
      const journal = journals[0]
      expect(journal.karikata_value).toBe(1500)
      expect(journal.kasikata_value).toBe(1500)
      expect(journal.note).toBe('Valid journal entry test')
      expect(journal.checked).toBe('0')
      expect(journal.deleted).toBe('0')
    }),
  )
})
