import { createApiRoute, withTransaction } from '@/lib/backend/api-transaction'
import { getFiscalYears } from '@/lib/backend/services/masters/get-fiscal-years'

export const GET = createApiRoute(async (db) => {
  return withTransaction(db, async (tx) => {
    return await getFiscalYears(tx)
  })
})
