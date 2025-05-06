import {
  Connection,
  RouteContext,
  createApiRoute,
  withTransaction,
} from '@/lib/api-transaction'
import { listAccounts } from '@/lib/services/masters/list-accounts'

export function listAccountsHandler(
  conn: Connection,
  { ctx }: { ctx: RouteContext },
) {
  return withTransaction(conn, async (tx) => {
    const { year: fiscalYear } = await ctx.params
    return await listAccounts(tx, { fiscalYear })
  })
}

export const GET = createApiRoute(listAccountsHandler)
