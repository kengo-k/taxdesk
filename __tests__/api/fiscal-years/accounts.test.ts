// 実際のパスに合わせて修正してください
import { testApiHandler } from 'next-test-api-route-handler'

import { withTransactionForTest } from '@/__tests__/framework/test-helpers'
import * as handler from '@/app/api/fiscal-years/[year]/accounts/route'
import { createApiRoute } from '@/lib/backend/api-transaction'

describe('GET /api/fiscal-years/[year]/accounts', () => {
  it(
    'should return accounts',
    withTransactionForTest([], async (tx) => {
      await testApiHandler({
        appHandler: { GET: createApiRoute(handler.listAccountsHandler, tx) },
        paramsPatcher: () => ({ year: '2024' }),
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' })
          expect(res.status).toBe(200)
          const response = await res.json()
          expect(response.success).toBe(true)
          expect(response.data).toBeDefined()
          expect(Array.isArray(response.data)).toBe(true)
          expect(response.data.length).toBeGreaterThan(0)
        },
      })
    }),
  )
})
