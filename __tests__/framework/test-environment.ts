import { CsvHelpers } from './csv-helpers'

import { PrismaClient } from '@prisma/client'

/**
 * テスト環境全体を管理するクラス
 */
export class TestEnvironment {
  private static instance: TestEnvironment
  private prisma: PrismaClient
  private isInitialized = false

  private constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): TestEnvironment {
    if (!this.instance) {
      this.instance = new TestEnvironment()
    }
    return this.instance
  }

  /**
   * テスト環境を初期化
   * Jest のグローバルセットアップから呼び出すことを想定
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('テスト環境を初期化しています...')

    try {
      // 基本的なマスタデータをセットアップ
      await this.setupBaseMasterData()

      this.isInitialized = true
      console.log('テスト環境の初期化が完了しました')
    } catch (error) {
      console.error('テスト環境の初期化に失敗しました:', error)
      throw error
    }
  }

  /**
   * テストに必要な基本マスタデータをセットアップ
   */
  private async setupBaseMasterData(): Promise<void> {
    try {
      // 既存データを削除（テーブルをクリア）
      console.log('既存のマスタデータをクリアしています...')
      await this.prisma.nendo_masters.deleteMany()
      console.log('マスタデータのクリアが完了しました')

      // CSVからデータをロード - 失敗したら例外をスロー
      console.log('CSVからマスタデータをロードしています...')
      await CsvHelpers.importCsvToTable(
        this.prisma,
        'nendo_masters',
        'seed/nendo_masters.csv',
        (record) => ({
          ...record,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      )
      console.log('マスタデータのロードが完了しました')

      // 他の必要なマスタデータもここでセットアップ
      // 注: 他のテーブルを追加する場合は、同様にdeleteMany()を実行してからデータを投入する
    } catch (error) {
      console.error('基本マスタデータのセットアップエラー:', error)
      throw error
    }
  }

  /**
   * テスト環境をクリーンアップ
   * Jest のグローバルティアダウンから呼び出すことを想定
   */
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect()
  }

  /**
   * 現在のPrismaクライアントを取得
   */
  getPrisma(): PrismaClient {
    return this.prisma
  }
}
