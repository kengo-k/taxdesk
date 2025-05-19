import {
  Connection,
  createApiRoute,
  withTransaction,
} from '@/lib/backend/api-transaction'
import { getFiscalYears } from '@/lib/backend/services/masters/get-fiscal-years'

export function getFiscalYearsHandler(conn: Connection) {
  return withTransaction(conn, async (tx) => {
    return await getFiscalYears(tx)
  })
}

export const GET = createApiRoute(getFiscalYearsHandler)
