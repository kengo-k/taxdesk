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

      // ApiErrorが発生することを期待
      const error = await createLedger(tx, input).catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
    }),
  )
})
