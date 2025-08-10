import { NextRequest, NextResponse } from 'next/server'

// バックアップライブラリからコア機能をimport
const { createBackup, listBackups } = require('../../../bin/backup-lib.js')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { comment } = body

    console.log('バックアップAPI呼び出し:', { comment })

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'バックアップコメントは必須です',
        },
        { status: 400 },
      )
    }

    // 実際のバックアップ作成を実行
    const result = await createBackup(comment.trim())
    console.log('バックアップ作成結果:', result)

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
  } catch (error) {
    console.error('バックアップAPIエラー:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'バックアップの作成に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    console.log('バックアップ一覧API呼び出し')

    // 実際のバックアップ一覧を取得
    const backupList = await listBackups(10)
    console.log('バックアップ一覧取得結果:', backupList)

    // バックアップデータをUI用の形式に変換
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
  } catch (error) {
    console.error('バックアップ一覧APIエラー:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'バックアップ一覧の取得に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
