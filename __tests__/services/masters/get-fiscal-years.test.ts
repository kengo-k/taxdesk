import { withCsvData, withTransaction } from '../../framework/test-helpers'

import { getFiscalYears } from '@/lib/services/masters/get-fiscal-years'

describe('getFiscalYears', () => {
  /**
   * 事前セットアップされたデータを使用するテスト
   * (TestEnvironmentで最低限のデータがすでにセットアップされている想定)
   */
  it(
    '事前セットアップされたデータを使用するテスト',
    withTransaction(async (tx) => {
      // テスト実行
      const result = await getFiscalYears(tx)

      // 検証
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('label')
      expect(result[0]).toHaveProperty('startDate')
      expect(result[0]).toHaveProperty('endDate')
      expect(result[0]).toHaveProperty('isCurrent')
    }),
  )

  /**
   * CSVからデータをロードして使用するテスト
   */
  it(
    'CSVからデータをロードして使用するテスト',
    withCsvData(['seed/nendo_masters.csv'], async (tx) => {
      // テスト実行
      const result = await getFiscalYears(tx)

      // 検証
      expect(result.length).toBeGreaterThan(0)
      // CSVに含まれる最初の年度に関する検証
      // 注: 実際のCSVデータに合わせて検証条件を調整する必要あり
    }),
  )
})
