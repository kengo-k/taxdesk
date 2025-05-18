import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { KAMOKU_BUNRUI } from '@/lib/constants/kamoku-bunrui'
import { BreakdownRequest } from '@/lib/services/reports/calculate-breakdown'

// 既存APIレスポンスの型定義
interface BreakdownItemBase {
  saimoku_cd: string
  saimoku_full_name: string
  saimoku_ryaku_name: string
  value: number
}

interface MonthlyBreakdownItem extends BreakdownItemBase {
  month: string
}

interface YearlyBreakdownItem extends BreakdownItemBase {}

// 汎用APIレスポンスの型定義
interface GenericBreakdownItem {
  code: string
  name: string
  value: number
  month?: string // 月別データの場合のみ
}

interface GenericMonthlyBreakdownItem {
  code: string
  name: string
  values: { month: string; value: number }[]
}

interface GenericBreakdownResponse {
  monthly: {
    request: BreakdownRequest
    response: GenericMonthlyBreakdownItem
  }[]
  annual: {
    request: BreakdownRequest
    response: GenericBreakdownItem
  }[]
}

// 税額計算に必要なデータの型定義
// 年度ごとに必要なパラメータが変わる可能性があるため、
// 柔軟な型定義としています
export type TaxCalculationData = Record<string, any>

export interface ReportState {
  // 内訳データ用の状態
  breakdown: {
    saimokuNetAssetsByYear: {
      data: YearlyBreakdownItem[] | null
      loading: boolean
      error: string | null
    }
    saimokuNetRevenuesByYear: {
      data: YearlyBreakdownItem[] | null
      loading: boolean
      error: string | null
    }
    saimokuNetExpensesByYear: {
      data: YearlyBreakdownItem[] | null
      loading: boolean
      error: string | null
    }
    saimokuNetRevenuesByMonth: {
      data: MonthlyBreakdownItem[] | null
      loading: boolean
      error: string | null
    }
    saimokuNetExpensesByMonth: {
      data: MonthlyBreakdownItem[] | null
      loading: boolean
      error: string | null
    }
  }

  // 税額計算用の状態
  taxCalculation: {
    data: TaxCalculationData | null
    loading: boolean
    error: string | null
  }
}

const initialState: ReportState = {
  // 内訳データ用の初期状態
  breakdown: {
    saimokuNetAssetsByYear: {
      data: null,
      loading: false,
      error: null,
    },
    saimokuNetRevenuesByYear: {
      data: null,
      loading: false,
      error: null,
    },
    saimokuNetExpensesByYear: {
      data: null,
      loading: false,
      error: null,
    },
    saimokuNetRevenuesByMonth: {
      data: null,
      loading: false,
      error: null,
    },
    saimokuNetExpensesByMonth: {
      data: null,
      loading: false,
      error: null,
    },
  },

  // 税額計算用の初期状態
  taxCalculation: {
    data: null,
    loading: false,
    error: null,
  },
}

// 汎用API用のThunkアクション
export const fetchGenericAssetByYear = createAsyncThunk(
  'report/fetchGenericAssetByYear',
  async (fiscalYear: string) => {
    const response = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/breakdown`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              kamokuBunruiCd: KAMOKU_BUNRUI.ASSET,
              breakdownLevel: 'saimoku',
              breakdownType: 'net',
              timeUnit: 'annual',
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      throw new Error('Failed to fetch asset breakdown by year')
    }

    const result = await response.json()
    return result.data
  },
)

export const fetchGenericRevenueByYear = createAsyncThunk(
  'report/fetchGenericRevenueByYear',
  async (fiscalYear: string) => {
    const response = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/breakdown`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              kamokuBunruiCd: KAMOKU_BUNRUI.REVENUE,
              breakdownLevel: 'saimoku',
              breakdownType: 'net',
              timeUnit: 'annual',
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      throw new Error('Failed to fetch revenue breakdown by year')
    }

    const result = await response.json()
    return result.data
  },
)

export const fetchGenericExpenseByYear = createAsyncThunk(
  'report/fetchGenericExpenseByYear',
  async (fiscalYear: string) => {
    const response = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/breakdown`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              kamokuBunruiCd: KAMOKU_BUNRUI.EXPENSE,
              breakdownLevel: 'saimoku',
              breakdownType: 'net',
              timeUnit: 'annual',
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      throw new Error('Failed to fetch expense breakdown by year')
    }

    const result = await response.json()
    return result.data
  },
)

export const fetchGenericRevenueByMonth = createAsyncThunk(
  'report/fetchGenericRevenueByMonth',
  async (fiscalYear: string) => {
    const response = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/breakdown`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              kamokuBunruiCd: KAMOKU_BUNRUI.REVENUE,
              breakdownLevel: 'saimoku',
              breakdownType: 'net',
              timeUnit: 'month',
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      throw new Error('Failed to fetch revenue breakdown by month')
    }

    const result = await response.json()
    return result.data
  },
)

export const fetchGenericExpenseByMonth = createAsyncThunk(
  'report/fetchGenericExpenseByMonth',
  async (fiscalYear: string) => {
    const response = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/breakdown`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              kamokuBunruiCd: KAMOKU_BUNRUI.EXPENSE,
              breakdownLevel: 'saimoku',
              breakdownType: 'net',
              timeUnit: 'month',
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      throw new Error('Failed to fetch expense breakdown by month')
    }

    const result = await response.json()
    return result.data
  },
)

/**
 * 税額計算に必要なデータを取得するThunkアクション
 *
 * 収益、費用、利息収入などのデータを取得し、税額計算に必要なパラメータを構築します。
 * 特に、利息収入に対する源泉徴収税額を取得するために、利息収入の内訳データを取得します。
 */
export const fetchTaxCalculationData = createAsyncThunk(
  'report/fetchTaxCalculationData',
  async (fiscalYear: string) => {
    // 収益データの取得
    const revenueResponse = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/breakdown`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              kamokuBunruiCd: KAMOKU_BUNRUI.REVENUE,
              breakdownLevel: 'saimoku',
              breakdownType: 'net',
              timeUnit: 'annual',
            },
          ],
        }),
      },
    )

    if (!revenueResponse.ok) {
      throw new Error('Failed to fetch revenue data')
    }

    const revenueData = await revenueResponse.json()
    const revenueItems = convertToYearlyBreakdownFormat(revenueData.data)

    // 費用データの取得
    const expenseResponse = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/breakdown`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              kamokuBunruiCd: KAMOKU_BUNRUI.EXPENSE,
              breakdownLevel: 'saimoku',
              breakdownType: 'net',
              timeUnit: 'annual',
            },
          ],
        }),
      },
    )

    if (!expenseResponse.ok) {
      throw new Error('Failed to fetch expense data')
    }

    const expenseData = await expenseResponse.json()
    const expenseItems = convertToYearlyBreakdownFormat(expenseData.data)

    // 税額計算に必要なデータを抽出
    let sales = 0
    let interest_revenue = 0
    let expenses = 0
    let national_withheld_tax = 0
    let local_withheld_tax = 0

    // 収益データから売上高と利息収入を抽出
    for (const item of revenueItems) {
      // 利息収入の特定（科目コードや名前で判断）
      if (
        item.saimoku_full_name.includes('利息') ||
        item.saimoku_cd === '5002'
      ) {
        interest_revenue += item.value

        // 利息収入に対する源泉徴収税額の計算（例: 利息収入の20.315%）
        // 実際の源泉徴収税率は法律に基づいて設定する必要があります
        const withholdingTaxRate = 0.20315 // 所得税15.315% + 住民税5%
        const totalWithholdingTax = interest_revenue * withholdingTaxRate

        // 国税と地方税に分割
        national_withheld_tax = interest_revenue * 0.15315 // 所得税+復興特別所得税
        local_withheld_tax = interest_revenue * 0.05 // 住民税
      } else {
        // その他の収益は売上高として計上
        sales += item.value
      }
    }

    // 費用データから費用合計を計算
    for (const item of expenseItems) {
      expenses += item.value
    }

    // 前年度事業税は現時点では0とする（実際には前年度データから取得する必要がある）
    const previous_business_tax = 0

    // 法人税控除額は現時点では0とする
    const corporate_tax_deduction = 0

    // 消費税課税区分は現時点では免税事業者とする
    const is_consumption_tax_exempt = true

    // 税額計算データを返す
    return {
      sales,
      interest_revenue,
      expenses,
      previous_business_tax,
      national_withheld_tax,
      local_withheld_tax,
      corporate_tax_deduction,
      is_consumption_tax_exempt,
    } as TaxCalculationData
  },
)

// レスポンスデータの変換ロジック
const convertToYearlyBreakdownFormat = (
  data: GenericBreakdownResponse,
): YearlyBreakdownItem[] => {
  console.log('Annual data received:', data)
  if (data.annual && data.annual.length > 0) {
    return data.annual.map((item) => ({
      saimoku_cd: item.response.code,
      saimoku_full_name: item.response.name,
      saimoku_ryaku_name: item.response.name,
      value: item.response.value,
    }))
  }
  return []
}

const convertToMonthlyBreakdownFormat = (
  data: GenericBreakdownResponse,
): MonthlyBreakdownItem[] => {
  console.log('Monthly data received:', data)
  if (data.monthly && data.monthly.length > 0) {
    const result: MonthlyBreakdownItem[] = []

    // 各コードごとの月別データを展開
    for (const item of data.monthly) {
      const { code, name, values } = item.response

      for (const monthData of values) {
        result.push({
          saimoku_cd: code,
          saimoku_full_name: name,
          saimoku_ryaku_name: name,
          month: monthData.month,
          value: monthData.value,
        })
      }
    }

    console.log('Converted monthly data:', result)
    return result
  }
  return []
}

export const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    // 内訳データ用のクリアアクション
    clearSaimokuNetAssetsByYear: (state) => {
      state.breakdown.saimokuNetAssetsByYear =
        initialState.breakdown.saimokuNetAssetsByYear
    },
    clearSaimokuNetRevenuesByYear: (state) => {
      state.breakdown.saimokuNetRevenuesByYear =
        initialState.breakdown.saimokuNetRevenuesByYear
    },
    clearSaimokuNetExpensesByYear: (state) => {
      state.breakdown.saimokuNetExpensesByYear =
        initialState.breakdown.saimokuNetExpensesByYear
    },
    clearSaimokuNetRevenuesByMonth: (state) => {
      state.breakdown.saimokuNetRevenuesByMonth =
        initialState.breakdown.saimokuNetRevenuesByMonth
    },
    clearSaimokuNetExpensesByMonth: (state) => {
      state.breakdown.saimokuNetExpensesByMonth =
        initialState.breakdown.saimokuNetExpensesByMonth
    },
  },
  extraReducers: (builder) => {
    // 内訳データ用のReducers
    // 資産の年別集計
    builder
      .addCase(fetchGenericAssetByYear.pending, (state) => {
        state.breakdown.saimokuNetAssetsByYear.loading = true
        state.breakdown.saimokuNetAssetsByYear.error = null
      })
      .addCase(fetchGenericAssetByYear.fulfilled, (state, action) => {
        state.breakdown.saimokuNetAssetsByYear.loading = false
        state.breakdown.saimokuNetAssetsByYear.data =
          convertToYearlyBreakdownFormat(action.payload)
      })
      .addCase(fetchGenericAssetByYear.rejected, (state, action) => {
        state.breakdown.saimokuNetAssetsByYear.loading = false
        state.breakdown.saimokuNetAssetsByYear.error =
          action.error.message || 'Unknown error'
      })

    // 収益の年別集計
    builder
      .addCase(fetchGenericRevenueByYear.pending, (state) => {
        state.breakdown.saimokuNetRevenuesByYear.loading = true
        state.breakdown.saimokuNetRevenuesByYear.error = null
      })
      .addCase(fetchGenericRevenueByYear.fulfilled, (state, action) => {
        state.breakdown.saimokuNetRevenuesByYear.loading = false
        state.breakdown.saimokuNetRevenuesByYear.data =
          convertToYearlyBreakdownFormat(action.payload)
      })
      .addCase(fetchGenericRevenueByYear.rejected, (state, action) => {
        state.breakdown.saimokuNetRevenuesByYear.loading = false
        state.breakdown.saimokuNetRevenuesByYear.error =
          action.error.message || 'Unknown error'
      })

    // 費用の年別集計
    builder
      .addCase(fetchGenericExpenseByYear.pending, (state) => {
        state.breakdown.saimokuNetExpensesByYear.loading = true
        state.breakdown.saimokuNetExpensesByYear.error = null
      })
      .addCase(fetchGenericExpenseByYear.fulfilled, (state, action) => {
        state.breakdown.saimokuNetExpensesByYear.loading = false
        state.breakdown.saimokuNetExpensesByYear.data =
          convertToYearlyBreakdownFormat(action.payload)
      })
      .addCase(fetchGenericExpenseByYear.rejected, (state, action) => {
        state.breakdown.saimokuNetExpensesByYear.loading = false
        state.breakdown.saimokuNetExpensesByYear.error =
          action.error.message || 'Unknown error'
      })

    // 収益の月別集計
    builder
      .addCase(fetchGenericRevenueByMonth.pending, (state) => {
        state.breakdown.saimokuNetRevenuesByMonth.loading = true
        state.breakdown.saimokuNetRevenuesByMonth.error = null
      })
      .addCase(fetchGenericRevenueByMonth.fulfilled, (state, action) => {
        state.breakdown.saimokuNetRevenuesByMonth.loading = false
        state.breakdown.saimokuNetRevenuesByMonth.data =
          convertToMonthlyBreakdownFormat(action.payload)
      })
      .addCase(fetchGenericRevenueByMonth.rejected, (state, action) => {
        state.breakdown.saimokuNetRevenuesByMonth.loading = false
        state.breakdown.saimokuNetRevenuesByMonth.error =
          action.error.message || 'Unknown error'
      })

    // 費用の月別集計
    builder
      .addCase(fetchGenericExpenseByMonth.pending, (state) => {
        state.breakdown.saimokuNetExpensesByMonth.loading = true
        state.breakdown.saimokuNetExpensesByMonth.error = null
      })
      .addCase(fetchGenericExpenseByMonth.fulfilled, (state, action) => {
        state.breakdown.saimokuNetExpensesByMonth.loading = false
        state.breakdown.saimokuNetExpensesByMonth.data =
          convertToMonthlyBreakdownFormat(action.payload)
      })
      .addCase(fetchGenericExpenseByMonth.rejected, (state, action) => {
        state.breakdown.saimokuNetExpensesByMonth.loading = false
        state.breakdown.saimokuNetExpensesByMonth.error =
          action.error.message || 'Unknown error'
      })

    // 税額計算データ
    builder
      .addCase(fetchTaxCalculationData.pending, (state) => {
        state.taxCalculation.loading = true
        state.taxCalculation.error = null
      })
      .addCase(fetchTaxCalculationData.fulfilled, (state, action) => {
        state.taxCalculation.loading = false
        state.taxCalculation.data = action.payload
      })
      .addCase(fetchTaxCalculationData.rejected, (state, action) => {
        state.taxCalculation.loading = false
        state.taxCalculation.error = action.error.message || 'Unknown error'
      })
  },
})

export const {
  // 内訳データ用のクリアアクション
  clearSaimokuNetAssetsByYear,
  clearSaimokuNetRevenuesByYear,
  clearSaimokuNetExpensesByYear,
  clearSaimokuNetRevenuesByMonth,
  clearSaimokuNetExpensesByMonth,
} = reportSlice.actions

export default reportSlice.reducer

// 内訳データ用のセレクター
export const selectSaimokuNetAssetsByYear = (state: { report: ReportState }) =>
  state.report.breakdown.saimokuNetAssetsByYear.data

export const selectSaimokuNetAssetsByYearLoading = (state: {
  report: ReportState
}) => state.report.breakdown.saimokuNetAssetsByYear.loading

export const selectSaimokuNetRevenuesByYear = (state: {
  report: ReportState
}) => state.report.breakdown.saimokuNetRevenuesByYear.data

export const selectSaimokuNetRevenuesByYearLoading = (state: {
  report: ReportState
}) => state.report.breakdown.saimokuNetRevenuesByYear.loading

export const selectSaimokuNetExpensesByYear = (state: {
  report: ReportState
}) => state.report.breakdown.saimokuNetExpensesByYear.data

export const selectSaimokuNetExpensesByYearLoading = (state: {
  report: ReportState
}) => state.report.breakdown.saimokuNetExpensesByYear.loading

export const selectSaimokuNetRevenuesByMonth = (state: {
  report: ReportState
}) => state.report.breakdown.saimokuNetRevenuesByMonth.data

export const selectSaimokuNetRevenuesByMonthLoading = (state: {
  report: ReportState
}) => state.report.breakdown.saimokuNetRevenuesByMonth.loading

export const selectSaimokuNetExpensesByMonth = (state: {
  report: ReportState
}) => state.report.breakdown.saimokuNetExpensesByMonth.data

export const selectSaimokuNetExpensesByMonthLoading = (state: {
  report: ReportState
}) => state.report.breakdown.saimokuNetExpensesByMonth.loading

// 税額計算用のセレクター
export const selectTaxCalculationData = (state: { report: ReportState }) =>
  state.report.taxCalculation.data

export const selectTaxCalculationLoading = (state: { report: ReportState }) =>
  state.report.taxCalculation.loading

export const selectTaxCalculationError = (state: { report: ReportState }) =>
  state.report.taxCalculation.error
