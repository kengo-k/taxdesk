import { NextRequest, NextResponse } from 'next/server'

import { ApiError, ApiErrorType } from '@/lib/backend/api-error'
import {
  Connection,
  RouteContext,
  createApiRoute,
} from '@/lib/backend/api-transaction'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { restoreFromS3 } = require('../../../../bin/backup-lib.js')

export async function restoreBackupHandler(
  _conn: Connection,
  { req }: { req: NextRequest; ctx: RouteContext },
) {
  const body = await req.json()
  const { backupId } = body

  console.log('バックアップリストアAPI呼び出し:', { backupId })

  if (!backupId || !backupId.trim()) {
    throw new ApiError('バックアップIDは必須です', ApiErrorType.VALIDATION)
  }

  const result = await restoreFromS3(backupId.trim())
  console.log('リストア実行結果:', result)

  return NextResponse.json({
    success: true,
    message: 'データベースの復元が完了しました',
    restore: {
      backupId: result.timestamp,
      tablesRestored: result.tablesRestored,
      timestamp: result.timestamp,
      metadata: result.metadata,
    },
  })
}

export const POST = createApiRoute(restoreBackupHandler)
