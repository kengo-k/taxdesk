import { withTransactionForTest } from '@/__tests__/framework/test-helpers'
import { listAccounts } from '@/lib/backend/services/masters/list-accounts'

describe('listAccounts', () => {
  it(
    'should return a successful response',
    withTransactionForTest([], async (tx) => {
      const result = await listAccounts(tx, {
        fiscalYear: '2025',
      })
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
    }),
  )
})
