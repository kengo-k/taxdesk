import { NextRequest, NextResponse } from 'next/server'

import { ApiError, ApiErrorType } from '@/lib/backend/api-error'
import {
  Connection,
  RouteContext,
  createApiRoute,
} from '@/lib/backend/api-transaction'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createBackup, listBackups } = require('../../../bin/backup-lib.js')

export async function createBackupHandler(
  _conn: Connection,
  { req }: { req: NextRequest; ctx: RouteContext },
) {
  const body = await req.json()
  const { comment } = body

  if (!comment || !comment.trim()) {
    throw new ApiError(
      'バックアップコメントは必須です',
      ApiErrorType.VALIDATION,
    )
  }

  const result = await createBackup(comment.trim())

  return NextResponse.json({
    success: true,
    message: 'バックアップが正常に作成されました',
    backup: {
      id: result.timestamp,
      comment: result.comment,
      created_at: new Date().toISOString(),
      timestamp: result.timestamp,
      migration: result.migrationInfo?.migrationName || 'Unknown',
      tables: result.tables,
      locations: result.locations,
    },
  })
}

export async function listBackupsHandler(
  _conn: Connection,
  _ctx: { req: NextRequest; ctx: RouteContext },
) {
  const backupList = await listBackups(10)

  const backups = backupList.map((backup: any) => ({
    id: backup.id,
    timestamp: backup.timestamp,
    migration: backup.migration,
    comment: backup.comment,
    size: backup.size || 0,
    sizeFormatted: backup.sizeFormatted || 'Unknown',
    created_at:
      backup.metadata?.createdAt ||
      `${backup.timestamp.slice(0, 4)}-${backup.timestamp.slice(4, 6)}-${backup.timestamp.slice(6, 8)}T${backup.timestamp.slice(8, 10)}:${backup.timestamp.slice(10, 12)}:${backup.timestamp.slice(12, 14)}Z`,
    status: 'completed',
  }))

  return NextResponse.json({
    success: true,
    backups,
  })
}

export const POST = createApiRoute(createBackupHandler)
export const GET = createApiRoute(listBackupsHandler)
