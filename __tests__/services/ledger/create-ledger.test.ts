import { withTransaction } from '../../framework/test-helpers'

import { ApiError } from '@/lib/api-error'
import { createLedger } from '@/lib/services/ledger/create-ledger'

describe('createLedger', () => {
  it(
    '同じ科目コードが指定された場合、ApiErrorが発生する',
    withTransaction([], async (tx) => {
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
    '存在しない科目コードが指定された場合、ApiErrorが発生する',
    withTransaction([], async (tx) => {
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
    '存在しない借方科目コードが指定された場合、ApiErrorが発生する',
    withTransaction([], async (tx) => {
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
    '借方科目コードがA11、貸方科目コードがE61で、借方金額と貸方金額の両方が未設定の場合、ApiErrorが発生する',
    withTransaction([], async (tx) => {
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
    '借方科目コードがA11、貸方科目コードがE61で、借方金額と貸方金額の両方が設定されている場合、ApiErrorが発生する',
    withTransaction([], async (tx) => {
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
    '英字など明らかに日付ではないdateが設定された場合、ApiErrorが発生する',
    withTransaction([], async (tx) => {
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
      console.log(error)
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
    '2/30など存在しない日付の場合、ApiErrorが発生する',
    withTransaction([], async (tx) => {
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
    '日付として正しいが年度の範囲外である場合、ApiErrorが発生する',
    withTransaction([], async (tx) => {
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
})
