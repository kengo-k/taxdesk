import { createApiRoute, withTransaction } from '@/lib/api-transaction'
import { listAccounts } from '@/lib/services/masters/list-accounts'

export const GET = createApiRoute(async (db, { ctx }) => {
  const fiscalYear = ctx.params.year
  return withTransaction(db, async (tx) => {
    return await listAccounts(tx, { fiscalYear })
  })
})
