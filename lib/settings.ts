/**
 * アプリケーション全体の設定
 */

/**
 * モックAPIを使用するかどうか
 * true: モックAPIを使用する（開発・テスト環境向け）
 * false: 本番APIを使用する（本番環境向け）
 */
export const useMock = true

/**
 * APIのベースURL
 * モックAPIを使用する場合は使用されません
 */
export const apiBaseUrl = "https://api.example.com"

/**
 * その他の設定項目
 */
export const settings = {
  // アプリケーション名
  appName: "税額計算アプリ",

  // デフォルトの年度
  defaultNendo: "2024",

  // APIタイムアウト（ミリ秒）
  apiTimeout: 10000,

  // モックAPIの遅延時間（ミリ秒）
  mockDelay: 500,
}
