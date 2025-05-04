import { TestEnvironment } from './test-environment'

// Jestのグローバルセットアップ
beforeAll(async () => {
  // テスト環境を初期化
  await TestEnvironment.getInstance().initialize()
}, 30000) // タイムアウトを30秒に設定

// Jestのグローバルティアダウン
afterAll(async () => {
  await TestEnvironment.getInstance().cleanup()
})
