import { NextRequest, NextResponse } from 'next/server'

// バックアップライブラリからリストア機能をimport
const { restoreFromS3 } = require('../../../../bin/backup-lib.js')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { backupId } = body

    console.log('バックアップリストアAPI呼び出し:', { backupId })

    if (!backupId || !backupId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'バックアップIDは必須です',
        },
        { status: 400 },
      )
    }

    // 実際のリストア処理を実行
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
  } catch (error) {
    console.error('バックアップリストアAPIエラー:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'データベースの復元に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
