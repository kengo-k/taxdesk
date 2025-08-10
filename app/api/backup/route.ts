import { NextRequest, NextResponse } from 'next/server'

// バックアップライブラリからコア機能をimport
const { getBackupStatus, listBackups } = require('../../../bin/backup-lib.js')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { comment } = body

    console.log('バックアップAPI呼び出し:', { comment })

    // バックアップスクリプトの関数を呼び出し
    const scriptResult = getBackupStatus()
    console.log('バックアップスクリプトの結果:', scriptResult)

    // 疎通確認用のモック処理（2秒待機）
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return NextResponse.json({
      success: true,
      message: 'バックアップが正常に作成されました（スクリプト連携テスト）',
      scriptResult, // スクリプトからの結果を含める
      backup: {
        id: `backup_${Date.now()}`,
        comment: comment || 'Web UI backup',
        created_at: new Date().toISOString(),
        size: '1.2MB',
        status: 'completed',
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
