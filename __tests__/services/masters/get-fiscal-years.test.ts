import { withTransaction } from '../../framework/test-helpers'

import { getFiscalYears } from '@/lib/services/masters/get-fiscal-years'

describe('getFiscalYears', () => {
  /**
   * CSVからデータをロードして使用するテスト
   * テストファイルと同じディレクトリにあるCSVファイルを使用
   */
  it(
    'CSVからデータをロードして使用するテスト',
    withTransaction([], async (tx) => {
      // テスト実行
      const result = await getFiscalYears(tx)

      // 検証
      expect(result.length).toBeGreaterThan(0)
      // CSVに含まれる最初の年度に関する検証
      // 注: 実際のCSVデータに合わせて検証条件を調整する必要あり
    }),
  )
})
