import { withTransactionForTest } from '@/__tests__/framework/test-helpers'
import { calcExpenseBreakdownByMonth } from '@/lib/services/reports/calc-expense-breakdown-by-month'

describe('calcExpenseBreakdownByMonth', () => {
  it(
    'should calculate expense breakdown by month correctly',
    withTransactionForTest(['calc-expense-breakdown-by-month'], async (tx) => {
      const result = await calcExpenseBreakdownByMonth(tx, {
        fiscalYear: '2024',
      })

      // 結果が存在することを確認
      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)

      // 全ての月（4-3）のデータが存在することを確認
      const months = new Set(result.map((r) => r.month))
      expect(months.size).toBe(12)
      const expectedMonths = [
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12',
        '01',
        '02',
        '03',
      ]
      expectedMonths.forEach((month) => {
        expect(months.has(month)).toBe(true)
      })

      // 役員報酬（E01）の月次合計を確認
      const yakuinHousyuu = result.filter((r) => r.saimoku_cd === 'E01')
      expect(yakuinHousyuu.length).toBe(12) // 12ヶ月分のデータ
      yakuinHousyuu.forEach((item) => {
        expect(item.value).toBe(100000) // 毎月10万円
        expect(item.saimoku_full_name).toBe('役員報酬')
        expect(item.saimoku_ryaku_name).toBe('役員報酬')
      })

      // 地代家賃（E02）の月次合計を確認
      const tidaiYatin = result.filter((r) => r.saimoku_cd === 'E02')
      expect(tidaiYatin.length).toBe(12) // 12ヶ月分のデータ

      // 各月の地代家賃合計を確認
      const tidaiYatinByMonth = new Map(
        tidaiYatin.map((item) => [item.month, item.value]),
      )
      expect(tidaiYatinByMonth.get('04')).toBe(80000) // 4月: 50,000 + 30,000
      expect(tidaiYatinByMonth.get('05')).toBe(75000) // 5月: 50,000 + 25,000
      expect(tidaiYatinByMonth.get('06')).toBe(85000) // 6月: 50,000 + 35,000
      expect(tidaiYatinByMonth.get('07')).toBe(80000) // 7月: 50,000 + 30,000
      expect(tidaiYatinByMonth.get('08')).toBe(75000) // 8月: 50,000 + 25,000
      expect(tidaiYatinByMonth.get('09')).toBe(80000) // 9月: 50,000 + 30,000
      expect(tidaiYatinByMonth.get('10')).toBe(85000) // 10月: 50,000 + 35,000
      expect(tidaiYatinByMonth.get('11')).toBe(75000) // 11月: 50,000 + 25,000
      expect(tidaiYatinByMonth.get('12')).toBe(80000) // 12月: 50,000 + 30,000
      expect(tidaiYatinByMonth.get('01')).toBe(85000) // 1月: 50,000 + 35,000
      expect(tidaiYatinByMonth.get('02')).toBe(75000) // 2月: 50,000 + 25,000
      expect(tidaiYatinByMonth.get('03')).toBe(80000) // 3月: 50,000 + 30,000

      // 科目名称の確認
      tidaiYatin.forEach((item) => {
        expect(item.saimoku_full_name).toBe('地代家賃')
        expect(item.saimoku_ryaku_name).toBe('地代家賃')
      })

      // データが細目コードと月でソートされていることを確認
      const sorted = [...result].sort((a, b) => {
        if (a.saimoku_cd !== b.saimoku_cd) {
          return a.saimoku_cd.localeCompare(b.saimoku_cd)
        }
        return a.month.localeCompare(b.month)
      })
      expect(result).toEqual(sorted)
    }),
  )
})
