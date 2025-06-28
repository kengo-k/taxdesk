import { NextRequest, NextResponse } from 'next/server'

// バックアップライブラリからコア機能をimport
const { getBackupStatus } = require('../../../bin/backup-lib.js')

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

    const scriptResult = getBackupStatus()
    console.log('バックアップスクリプトの結果:', scriptResult)
    // 疎通確認用のモック一覧
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      backups: [
        {
          id: 'backup_20241228_001',
          comment: 'テストバックアップ1',
          created_at: '2024-12-28T10:00:00Z',
          size: '1.2MB',
          status: 'completed',
        },
        {
          id: 'backup_20241227_001',
          comment: 'テストバックアップ2',
          created_at: '2024-12-27T10:00:00Z',
          size: '1.1MB',
          status: 'completed',
        },
      ],
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
