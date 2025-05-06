// 実際のパスに合わせて修正してください
import { testApiHandler } from 'next-test-api-route-handler'

import * as handler from '@/app/api/fiscal-years/route'

describe('GET /api/fiscal-years', () => {
  it('should return fiscal years', async () => {
    await testApiHandler({
      appHandler: handler,
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
  })
})
