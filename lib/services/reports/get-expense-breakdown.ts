// 支出内訳データの型定義
export type ExpenseBreakdownData = {
  expenseTotal: number
  expenseData: number[]
  expenseLabels: string[]
  expenseAmounts: number[]
  expenseColors: string[]
  monthlyExpenseData: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor: string
    }>
  }
}

// モックデータ
const mockData: Record<string, ExpenseBreakdownData> = {
  '2022': {
    expenseTotal: 3000000,
    expenseData: [35, 25, 20, 10, 10],
    expenseLabels: ['役員報酬', '地代家賃', '消耗品費', '福利厚生費', '通信費'],
    expenseAmounts: [1050000, 750000, 600000, 300000, 300000],
    expenseColors: ['#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d'],
    monthlyExpenseData: {
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
          label: '役員報酬',
          data: [
            90000, 90000, 90000, 90000, 90000, 90000, 90000, 90000, 90000,
            90000, 90000, 90000,
          ],
          backgroundColor: '#b45309',
        },
        {
          label: '地代家賃',
          data: [
            65000, 65000, 65000, 65000, 65000, 65000, 65000, 65000, 65000,
            60000, 60000, 60000,
          ],
          backgroundColor: '#d97706',
        },
        {
          label: '消耗品費',
          data: [
            50000, 55000, 50000, 60000, 55000, 65000, 60000, 70000, 65000,
            50000, 45000, 55000,
          ],
          backgroundColor: '#f59e0b',
        },
        {
          label: '福利厚生費',
          data: [
            25000, 30000, 25000, 35000, 30000, 40000, 35000, 45000, 40000,
            25000, 20000, 30000,
          ],
          backgroundColor: '#fbbf24',
        },
        {
          label: '通信費',
          data: [
            25000, 30000, 25000, 30000, 25000, 30000, 25000, 30000, 25000,
            30000, 25000, 30000,
          ],
          backgroundColor: '#fcd34d',
        },
      ],
    },
  },
  '2023': {
    expenseTotal: 3480000,
    expenseData: [30, 25, 20, 15, 10],
    expenseLabels: ['役員報酬', '地代家賃', '消耗品費', '福利厚生費', '通信費'],
    expenseAmounts: [1044000, 870000, 696000, 522000, 348000],
    expenseColors: ['#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d'],
    monthlyExpenseData: {
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
          label: '役員報酬',
          data: [
            90000, 90000, 90000, 90000, 90000, 90000, 90000, 90000, 90000,
            90000, 90000, 90000,
          ],
          backgroundColor: '#b45309',
        },
        {
          label: '地代家賃',
          data: [
            75000, 75000, 75000, 75000, 75000, 75000, 75000, 75000, 75000,
            70000, 70000, 70000,
          ],
          backgroundColor: '#d97706',
        },
        {
          label: '消耗品費',
          data: [
            60000, 65000, 60000, 70000, 65000, 75000, 70000, 80000, 75000,
            60000, 55000, 65000,
          ],
          backgroundColor: '#f59e0b',
        },
        {
          label: '福利厚生費',
          data: [
            45000, 50000, 45000, 55000, 50000, 60000, 55000, 65000, 60000,
            45000, 40000, 50000,
          ],
          backgroundColor: '#fbbf24',
        },
        {
          label: '通信費',
          data: [
            30000, 35000, 30000, 35000, 30000, 35000, 30000, 35000, 30000,
            35000, 30000, 35000,
          ],
          backgroundColor: '#fcd34d',
        },
      ],
    },
  },
  '2024': {
    expenseTotal: 3960000,
    expenseData: [30, 25, 20, 15, 10],
    expenseLabels: ['役員報酬', '地代家賃', '消耗品費', '福利厚生費', '通信費'],
    expenseAmounts: [1188000, 990000, 792000, 594000, 396000],
    expenseColors: ['#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d'],
    monthlyExpenseData: {
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
          label: '役員報酬',
          data: [
            100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000,
            100000, 100000, 100000, 100000,
          ],
          backgroundColor: '#b45309',
        },
        {
          label: '地代家賃',
          data: [
            85000, 85000, 85000, 85000, 85000, 85000, 85000, 85000, 85000,
            80000, 80000, 80000,
          ],
          backgroundColor: '#d97706',
        },
        {
          label: '消耗品費',
          data: [
            65000, 75000, 70000, 80000, 75000, 85000, 80000, 90000, 85000,
            65000, 60000, 70000,
          ],
          backgroundColor: '#f59e0b',
        },
        {
          label: '福利厚生費',
          data: [
            50000, 60000, 55000, 65000, 60000, 70000, 65000, 75000, 70000,
            50000, 45000, 55000,
          ],
          backgroundColor: '#fbbf24',
        },
        {
          label: '通信費',
          data: [
            30000, 35000, 30000, 35000, 30000, 35000, 30000, 35000, 30000,
            35000, 30000, 35000,
          ],
          backgroundColor: '#fcd34d',
        },
      ],
    },
  },
}

/**
 * 指定された年度の支出内訳データを取得する
 * @param fiscalYear 年度
 * @returns 支出内訳データ
 */
export async function getExpenseBreakdown(
  fiscalYear: string,
): Promise<ExpenseBreakdownData> {
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
export async function getExpenseBreakdownMock(
  fiscalYear: string,
): Promise<ExpenseBreakdownData> {
  return getExpenseBreakdown(fiscalYear)
}
