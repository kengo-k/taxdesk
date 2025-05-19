import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
  AnnualBreakdown,
  MonthlyBreakdown,
} from '@/lib/backend/services/reports/calculate-breakdown'
import { KAMOKU_BUNRUI } from '@/lib/constants/kamoku-bunrui'

export interface ReportState {
  // 内訳データ用の状態
  breakdown: {
    saimokuNetAssetsByYear: {
      data: AnnualBreakdown[] | null
      loading: boolean
      error: string | null
    }
    saimokuNetRevenuesByYear: {
      data: AnnualBreakdown[] | null
      loading: boolean
      error: string | null
    }
    saimokuNetExpensesByYear: {
      data: AnnualBreakdown[] | null
      loading: boolean
      error: string | null
    }
    saimokuNetRevenuesByMonth: {
      data: MonthlyBreakdown[] | null
      loading: boolean
      error: string | null
    }
    saimokuNetExpensesByMonth: {
      data: MonthlyBreakdown[] | null
      loading: boolean
      error: string | null
    }
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
          action.payload.annual[0].response
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
          action.payload.annual[0].response
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
          action.payload.annual[0].response
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
          action.payload.monthly[0].response
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
          action.payload.monthly[0].response
      })
      .addCase(fetchGenericExpenseByMonth.rejected, (state, action) => {
        state.breakdown.saimokuNetExpensesByMonth.loading = false
        state.breakdown.saimokuNetExpensesByMonth.error =
          action.error.message || 'Unknown error'
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
