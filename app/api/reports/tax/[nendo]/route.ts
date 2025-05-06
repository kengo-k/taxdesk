import { createApiRoute, withTransaction } from '@/lib/api-transaction'
import { getFiscalYears } from '@/lib/services/masters/get-fiscal-years'

export const GET = createApiRoute(async (db) => {
  return withTransaction(db, async (tx) => {
    return await getFiscalYears(tx)
  })
})
