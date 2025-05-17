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

export interface ReportState {
  // 汎用API用の状態
  genericBreakdown: {
    assetByYear: {
      data: YearlyBreakdownItem[] | null
      loading: boolean
      error: string | null
    }
    revenueByYear: {
      data: YearlyBreakdownItem[] | null
      loading: boolean
      error: string | null
    }
    expenseByYear: {
      data: YearlyBreakdownItem[] | null
      loading: boolean
      error: string | null
    }
    revenueByMonth: {
      data: MonthlyBreakdownItem[] | null
      loading: boolean
      error: string | null
    }
    expenseByMonth: {
      data: MonthlyBreakdownItem[] | null
      loading: boolean
      error: string | null
    }
  }
}

const initialState: ReportState = {
  // 汎用API用の初期状態
  genericBreakdown: {
    assetByYear: {
      data: null,
      loading: false,
      error: null,
    },
    revenueByYear: {
      data: null,
      loading: false,
      error: null,
    },
    expenseByYear: {
      data: null,
      loading: false,
      error: null,
    },
    revenueByMonth: {
      data: null,
      loading: false,
      error: null,
    },
    expenseByMonth: {
      data: null,
      loading: false,
      error: null,
    },
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
    // 汎用API用のクリアアクション
    clearGenericAssetByYear: (state) => {
      state.genericBreakdown.assetByYear =
        initialState.genericBreakdown.assetByYear
    },
    clearGenericRevenueByYear: (state) => {
      state.genericBreakdown.revenueByYear =
        initialState.genericBreakdown.revenueByYear
    },
    clearGenericExpenseByYear: (state) => {
      state.genericBreakdown.expenseByYear =
        initialState.genericBreakdown.expenseByYear
    },
    clearGenericRevenueByMonth: (state) => {
      state.genericBreakdown.revenueByMonth =
        initialState.genericBreakdown.revenueByMonth
    },
    clearGenericExpenseByMonth: (state) => {
      state.genericBreakdown.expenseByMonth =
        initialState.genericBreakdown.expenseByMonth
    },
  },
  extraReducers: (builder) => {
    // 汎用API用のReducers
    // 資産の年別集計
    builder
      .addCase(fetchGenericAssetByYear.pending, (state) => {
        state.genericBreakdown.assetByYear.loading = true
        state.genericBreakdown.assetByYear.error = null
      })
      .addCase(fetchGenericAssetByYear.fulfilled, (state, action) => {
        state.genericBreakdown.assetByYear.loading = false
        state.genericBreakdown.assetByYear.data =
          convertToYearlyBreakdownFormat(action.payload)
      })
      .addCase(fetchGenericAssetByYear.rejected, (state, action) => {
        state.genericBreakdown.assetByYear.loading = false
        state.genericBreakdown.assetByYear.error =
          action.error.message || 'Unknown error'
      })

    // 収益の年別集計
    builder
      .addCase(fetchGenericRevenueByYear.pending, (state) => {
        state.genericBreakdown.revenueByYear.loading = true
        state.genericBreakdown.revenueByYear.error = null
      })
      .addCase(fetchGenericRevenueByYear.fulfilled, (state, action) => {
        state.genericBreakdown.revenueByYear.loading = false
        state.genericBreakdown.revenueByYear.data =
          convertToYearlyBreakdownFormat(action.payload)
      })
      .addCase(fetchGenericRevenueByYear.rejected, (state, action) => {
        state.genericBreakdown.revenueByYear.loading = false
        state.genericBreakdown.revenueByYear.error =
          action.error.message || 'Unknown error'
      })

    // 費用の年別集計
    builder
      .addCase(fetchGenericExpenseByYear.pending, (state) => {
        state.genericBreakdown.expenseByYear.loading = true
        state.genericBreakdown.expenseByYear.error = null
      })
      .addCase(fetchGenericExpenseByYear.fulfilled, (state, action) => {
        state.genericBreakdown.expenseByYear.loading = false
        state.genericBreakdown.expenseByYear.data =
          convertToYearlyBreakdownFormat(action.payload)
      })
      .addCase(fetchGenericExpenseByYear.rejected, (state, action) => {
        state.genericBreakdown.expenseByYear.loading = false
        state.genericBreakdown.expenseByYear.error =
          action.error.message || 'Unknown error'
      })

    // 収益の月別集計
    builder
      .addCase(fetchGenericRevenueByMonth.pending, (state) => {
        state.genericBreakdown.revenueByMonth.loading = true
        state.genericBreakdown.revenueByMonth.error = null
      })
      .addCase(fetchGenericRevenueByMonth.fulfilled, (state, action) => {
        state.genericBreakdown.revenueByMonth.loading = false
        state.genericBreakdown.revenueByMonth.data =
          convertToMonthlyBreakdownFormat(action.payload)
      })
      .addCase(fetchGenericRevenueByMonth.rejected, (state, action) => {
        state.genericBreakdown.revenueByMonth.loading = false
        state.genericBreakdown.revenueByMonth.error =
          action.error.message || 'Unknown error'
      })

    // 費用の月別集計
    builder
      .addCase(fetchGenericExpenseByMonth.pending, (state) => {
        state.genericBreakdown.expenseByMonth.loading = true
        state.genericBreakdown.expenseByMonth.error = null
      })
      .addCase(fetchGenericExpenseByMonth.fulfilled, (state, action) => {
        state.genericBreakdown.expenseByMonth.loading = false
        state.genericBreakdown.expenseByMonth.data =
          convertToMonthlyBreakdownFormat(action.payload)
      })
      .addCase(fetchGenericExpenseByMonth.rejected, (state, action) => {
        state.genericBreakdown.expenseByMonth.loading = false
        state.genericBreakdown.expenseByMonth.error =
          action.error.message || 'Unknown error'
      })
  },
})

export const {
  // 汎用API用のクリアアクション
  clearGenericAssetByYear,
  clearGenericRevenueByYear,
  clearGenericExpenseByYear,
  clearGenericRevenueByMonth,
  clearGenericExpenseByMonth,
} = reportSlice.actions

export default reportSlice.reducer

// 汎用API用のセレクター
export const selectGenericAssetByYear = (state: { report: ReportState }) =>
  state.report.genericBreakdown.assetByYear.data

export const selectGenericAssetByYearLoading = (state: {
  report: ReportState
}) => state.report.genericBreakdown.assetByYear.loading

export const selectGenericRevenueByYear = (state: { report: ReportState }) =>
  state.report.genericBreakdown.revenueByYear.data

export const selectGenericRevenueByYearLoading = (state: {
  report: ReportState
}) => state.report.genericBreakdown.revenueByYear.loading

export const selectGenericExpenseByYear = (state: { report: ReportState }) =>
  state.report.genericBreakdown.expenseByYear.data

export const selectGenericExpenseByYearLoading = (state: {
  report: ReportState
}) => state.report.genericBreakdown.expenseByYear.loading

export const selectGenericRevenueByMonth = (state: { report: ReportState }) =>
  state.report.genericBreakdown.revenueByMonth.data

export const selectGenericRevenueByMonthLoading = (state: {
  report: ReportState
}) => state.report.genericBreakdown.revenueByMonth.loading

export const selectGenericExpenseByMonth = (state: { report: ReportState }) =>
  state.report.genericBreakdown.expenseByMonth.data

export const selectGenericExpenseByMonthLoading = (state: {
  report: ReportState
}) => state.report.genericBreakdown.expenseByMonth.loading
