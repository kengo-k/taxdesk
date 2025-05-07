import { withTransactionForTest } from '../../framework/test-helpers'

import { ApiError } from '@/lib/api-error'
import { countLedgers } from '@/lib/services/ledger/count-ledgers'
import { createLedger } from '@/lib/services/ledger/create-ledger'

describe('createLedger', () => {
  it(
    'should throw ApiError when the same account code is specified',
    withTransactionForTest([], async (tx) => {
      // 同じ科目コードを指定
      const input = {
        nendo: '2021',
        date: '20210401',
        ledger_cd: 'XXX',
        karikata_value: 1000,
        counter_cd: 'XXX',
        note: 'test',
        checked: '0',
      }

      const error = await createLedger(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('SAME_ACCOUNT_CODES')
        expect(error.details[0].path).toEqual(['counter_cd'])
      }
    }),
  )

  it(
    'should throw ApiError when a non-existent account code is specified',
    withTransactionForTest([], async (tx) => {
      // 存在しない科目コードを指定
      const input = {
        nendo: '2021',
        date: '20210401',
        ledger_cd: 'XXX',
        karikata_value: 1000,
        counter_cd: 'A11',
        note: 'test',
        checked: '0',
      }

      const error = await createLedger(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('INVALID_ACCOUNT_CODE')
        expect(error.details[0].path).toEqual(['ledger_cd'])
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
        ledger_cd: 'A11',
        karikata_value: 1000,
        counter_cd: 'XXX',
        note: 'test',
        checked: '0',
      }

      const error = await createLedger(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('INVALID_ACCOUNT_CODE')
        expect(error.details[0].path).toEqual(['counter_cd'])
      }
    }),
  )

  it(
    'should throw ApiError when both debit and credit amounts are unset for A11 and E61 account codes',
    withTransactionForTest([], async (tx) => {
      const input = {
        nendo: '2021',
        date: '20210401',
        ledger_cd: 'A11',
        counter_cd: 'E61',
        note: 'test',
        checked: '0',
      }

      const error = await createLedger(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('MISSING_AMOUNT')
        expect(error.details[0].path).toEqual(['karikata_value'])
      }
    }),
  )

  it(
    'should throw ApiError when both debit and credit amounts are set for A11 and E61 account codes',
    withTransactionForTest([], async (tx) => {
      const input = {
        nendo: '2021',
        date: '20210401',
        ledger_cd: 'A11',
        karikata_value: 1000,
        counter_cd: 'E61',
        kasikata_value: 1000,
        note: 'test',
        checked: '0',
      }

      const error = await createLedger(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(1)
        expect(error.details[0].code).toBe('DUPLICATE_AMOUNT')
        expect(error.details[0].path).toEqual(['karikata_value'])
      }
    }),
  )

  it(
    'should throw ApiError when an invalid date format is specified',
    withTransactionForTest([], async (tx) => {
      const input = {
        nendo: '2021',
        date: 'invalid',
        ledger_cd: 'A11',
        karikata_value: 1000,
        counter_cd: 'E61',
        note: 'test',
        checked: '0',
      }

      const error = await createLedger(tx, input).catch((e) => e)
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
        ledger_cd: 'A11',
        karikata_value: 1000,
        counter_cd: 'E61',
        note: 'test',
        checked: '0',
      }

      const error = await createLedger(tx, input).catch((e) => e)
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
        ledger_cd: 'A11',
        karikata_value: 1000,
        counter_cd: 'E61',
        note: 'test',
        checked: '0',
      }

      const error = await createLedger(tx, input).catch((e) => e)
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
        ledger_cd: 'A11',
        karikata_value: 1000,
        counter_cd: 'E61',
        note: 'test',
        checked: '0',
      }

      const error = await createLedger(tx, input).catch((e) => e)
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
        ledger_cd: 'A11',
        counter_cd: 'E61',
        note: 'test',
        checked: '0',
      }

      const error = await createLedger(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      if (error instanceof ApiError) {
        expect(error.details).toBeInstanceOf(Array)
        expect(error.details.length).toBe(2)

        // 年度範囲外のエラー
        const outOfFiscalYearError = error.details.find(
          (detail) => detail.code === 'OUT_OF_FISCAL_YEAR',
        )
        expect(outOfFiscalYearError).toBeDefined()
        expect(outOfFiscalYearError?.path).toEqual(['date'])

        // 金額未設定のエラー
        const missingAmountError = error.details.find(
          (detail) => detail.code === 'MISSING_AMOUNT',
        )
        expect(missingAmountError).toBeDefined()
        expect(missingAmountError?.path).toEqual(['karikata_value'])
      }
    }),
  )

  it(
    'should create a ledger entry and return the correct count',
    withTransactionForTest([], async (tx) => {
      const input = {
        nendo: '2021',
        date: '20210401',
        ledger_cd: 'A11',
        karikata_value: 1000,
        counter_cd: 'E61',
        note: 'test',
        checked: '0',
      }

      // 登録前の件数を確認
      const initialCount = await countLedgers(tx, {
        fiscal_year: '2021',
        ledger_cd: 'A11',
        month: 'all',
      })
      expect(initialCount).toBe(0)

      // 登録を実行
      await createLedger(tx, input)

      // 登録後の件数を確認
      const finalCount = await countLedgers(tx, {
        fiscal_year: '2021',
        ledger_cd: 'A11',
        month: 'all',
      })
      expect(finalCount).toBe(1)
    }),
  )
})
