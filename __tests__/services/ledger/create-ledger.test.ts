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
})
