import { type NextRequest } from 'next/server'

import { createApiRoute, withTransaction } from '@/lib/backend/api-transaction'
import { getMigrationVersion } from '@/lib/backend/services/get-migration-version'

async function handleGet(conn: any, { req: _ }: { req: NextRequest }) {
  return withTransaction(conn, async (tx) => {
    const result = await getMigrationVersion(tx)
    return result
  })
}

export const GET = createApiRoute(handleGet)
