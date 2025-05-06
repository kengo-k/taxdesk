// 実際のパスに合わせて修正してください
import { testApiHandler } from 'next-test-api-route-handler'

import { withTransactionForTest } from '@/__tests__/framework/test-helpers'
import * as handler from '@/app/api/master/fiscal-years/route'
import { createApiRoute } from '@/lib/api-transaction'

describe('GET /api/master/fiscal-years', () => {
  it(
    'should return fiscal years',
    withTransactionForTest([], async (tx) => {
      await testApiHandler({
        appHandler: { GET: createApiRoute(handler.getFiscalYearsHandler, tx) },
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
