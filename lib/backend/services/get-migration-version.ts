import { Connection } from '@/lib/backend/api-transaction'

export async function getMigrationVersion(conn: Connection) {
  const result = await conn.$queryRaw<{ migration_name: string }[]>`
    SELECT migration_name
    FROM "_prisma_migrations"
    WHERE finished_at IS NOT NULL
    ORDER BY finished_at DESC
    LIMIT 1
  `

  if (result.length === 0) {
    throw new Error('No applied migrations found')
  }

  return {
    migrationVersion: result[0].migration_name,
  }
}
