// 収入内訳データの型定義
export type IncomeBreakdownData = {
  incomeTotal: number
  incomeData: number[]
  incomeLabels: string[]
  incomeAmounts: number[]
  incomeColors: string[]
  monthlyIncomeData: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor: string
    }>
  }
}

// モックデータ
const mockData: Record<string, IncomeBreakdownData> = {
  '2022': {
    incomeTotal: 3600000,
    incomeData: [45, 35, 20],
    incomeLabels: ['A社', 'B社', 'C社'],
    incomeAmounts: [1620000, 1260000, 720000],
    incomeColors: ['#047857', '#10b981', '#34d399'],
    monthlyIncomeData: {
      labels: [
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月',
        '1月',
        '2月',
        '3月',
      ],
      datasets: [
        {
          label: 'A社',
          data: [
            130000, 135000, 140000, 145000, 150000, 155000, 160000, 165000,
            170000, 120000, 125000, 130000,
          ],
          backgroundColor: '#047857',
        },
        {
          label: 'B社',
          data: [
            105000, 110000, 115000, 120000, 125000, 130000, 135000, 140000,
            145000, 100000, 105000, 110000,
          ],
          backgroundColor: '#10b981',
        },
        {
          label: 'C社',
          data: [
            60000, 65000, 70000, 75000, 80000, 85000, 90000, 95000, 100000,
            55000, 60000, 65000,
          ],
          backgroundColor: '#34d399',
        },
      ],
    },
  },
  '2023': {
    incomeTotal: 4200000,
    incomeData: [40, 35, 25],
    incomeLabels: ['A社', 'B社', 'C社'],
    incomeAmounts: [1680000, 1470000, 1050000],
    incomeColors: ['#047857', '#10b981', '#34d399'],
    monthlyIncomeData: {
      labels: [
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月',
        '1月',
        '2月',
        '3月',
      ],
      datasets: [
        {
          label: 'A社',
          data: [
            150000, 155000, 160000, 165000, 170000, 175000, 180000, 185000,
            190000, 140000, 145000, 150000,
          ],
          backgroundColor: '#047857',
        },
        {
          label: 'B社',
          data: [
            125000, 130000, 135000, 140000, 145000, 150000, 155000, 160000,
            165000, 120000, 125000, 130000,
          ],
          backgroundColor: '#10b981',
        },
        {
          label: 'C社',
          data: [
            85000, 90000, 95000, 100000, 105000, 110000, 115000, 120000, 125000,
            80000, 85000, 90000,
          ],
          backgroundColor: '#34d399',
        },
      ],
    },
  },
  '2024': {
    incomeTotal: 4800000,
    incomeData: [40, 35, 25],
    incomeLabels: ['A社', 'B社', 'C社'],
    incomeAmounts: [1920000, 1680000, 1200000],
    incomeColors: ['#047857', '#10b981', '#34d399'],
    monthlyIncomeData: {
      labels: [
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月',
        '1月',
        '2月',
        '3月',
      ],
      datasets: [
        {
          label: 'A社',
          data: [
            170000, 165000, 180000, 175000, 190000, 185000, 200000, 195000,
            210000, 150000, 160000, 155000,
          ],
          backgroundColor: '#047857',
        },
        {
          label: 'B社',
          data: [
            145000, 150000, 155000, 160000, 165000, 170000, 175000, 180000,
            185000, 130000, 135000, 140000,
          ],
          backgroundColor: '#10b981',
        },
        {
          label: 'C社',
          data: [
            105000, 110000, 115000, 120000, 125000, 130000, 135000, 140000,
            145000, 90000, 95000, 100000,
          ],
          backgroundColor: '#34d399',
        },
      ],
    },
  },
}

/**
 * 指定された年度の収入内訳データを取得する
 * @param fiscalYear 年度
 * @returns 収入内訳データ
 */
export async function getIncomeBreakdown(
  fiscalYear: string,
): Promise<IncomeBreakdownData> {
  // 実際の実装では、DBからデータを取得する処理を記述
  // 現時点では空実装とし、モックデータを返す

  // 指定された年度のデータを取得（存在しない場合は2024年度のデータを返す）
  const data = mockData[fiscalYear] || mockData['2024']

  // 実際のAPIでは処理に時間がかかることを模擬するために遅延を追加
  await new Promise((resolve) => setTimeout(resolve, 300))

  return data
}

/**
 * モック実装
 */
export async function getIncomeBreakdownMock(
  fiscalYear: string,
): Promise<IncomeBreakdownData> {
  return getIncomeBreakdown(fiscalYear)
}
