import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
  AnnualBreakdown,
  BreakdownRequest,
  MonthlyBreakdown,
} from '@/lib/backend/services/reports/calculate-breakdown'
import { selectTaxParameters } from '@/lib/client/tax-calculation/parameters'
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
  taxCalculationParameters: {
    data: {
      request: BreakdownRequest
      response: AnnualBreakdown[]
    }[]
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
  taxCalculationParameters: {
    data: [],
    loading: false,
    error: null,
  },
}

export const fetchTaxCalculationParameters = createAsyncThunk(
  'report/fetchTaxCalculationParameters',
  async (fiscalYear: string) => {
    const requests = selectTaxParameters(fiscalYear)
    const response = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/breakdown`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests }),
      },
    )
    if (!response.ok) {
      throw new Error('Failed to fetch asset breakdown by year')
    }

    const result = await response.json()
    return result.data
  },
)

export const fetchDashboardData = createAsyncThunk(
  'report/fetchDashboardData',
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
            {
              kamokuBunruiCd: KAMOKU_BUNRUI.REVENUE,
              breakdownLevel: 'saimoku',
              breakdownType: 'net',
              timeUnit: 'annual',
            },
            {
              kamokuBunruiCd: KAMOKU_BUNRUI.EXPENSE,
              breakdownLevel: 'saimoku',
              breakdownType: 'net',
              timeUnit: 'annual',
            },
            {
              kamokuBunruiCd: KAMOKU_BUNRUI.REVENUE,
              breakdownLevel: 'saimoku',
              breakdownType: 'net',
              timeUnit: 'month',
            },
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
      throw new Error('Failed to fetch dashboard data')
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
    builder
      .addCase(fetchTaxCalculationParameters.pending, (state) => {
        state.taxCalculationParameters.loading = true
        state.taxCalculationParameters.error = null
      })
      .addCase(fetchTaxCalculationParameters.fulfilled, (state, action) => {
        state.taxCalculationParameters.loading = false
        state.taxCalculationParameters.data = action.payload.annual
      })
      .addCase(fetchTaxCalculationParameters.rejected, (state, action) => {
        state.taxCalculationParameters.loading = false
        state.taxCalculationParameters.error =
          action.error.message || 'Unknown error'
      })

    // Dashboard data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.breakdown.saimokuNetAssetsByYear.loading = true
        state.breakdown.saimokuNetRevenuesByYear.loading = true
        state.breakdown.saimokuNetExpensesByYear.loading = true
        state.breakdown.saimokuNetRevenuesByMonth.loading = true
        state.breakdown.saimokuNetExpensesByMonth.loading = true
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        const { annual, monthly } = action.payload

        // Set loading to false for all states
        state.breakdown.saimokuNetAssetsByYear.loading = false
        state.breakdown.saimokuNetRevenuesByYear.loading = false
        state.breakdown.saimokuNetExpensesByYear.loading = false
        state.breakdown.saimokuNetRevenuesByMonth.loading = false
        state.breakdown.saimokuNetExpensesByMonth.loading = false

        // Update data for each state
        state.breakdown.saimokuNetAssetsByYear.data = annual[0].response
        state.breakdown.saimokuNetRevenuesByYear.data = annual[1].response
        state.breakdown.saimokuNetExpensesByYear.data = annual[2].response
        state.breakdown.saimokuNetRevenuesByMonth.data = monthly[0].response
        state.breakdown.saimokuNetExpensesByMonth.data = monthly[1].response
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        const error = action.error.message || 'Unknown error'
        state.breakdown.saimokuNetAssetsByYear.loading = false
        state.breakdown.saimokuNetRevenuesByYear.loading = false
        state.breakdown.saimokuNetExpensesByYear.loading = false
        state.breakdown.saimokuNetRevenuesByMonth.loading = false
        state.breakdown.saimokuNetExpensesByMonth.loading = false
        state.breakdown.saimokuNetAssetsByYear.error = error
        state.breakdown.saimokuNetRevenuesByYear.error = error
        state.breakdown.saimokuNetExpensesByYear.error = error
        state.breakdown.saimokuNetRevenuesByMonth.error = error
        state.breakdown.saimokuNetExpensesByMonth.error = error
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

export const selectTaxCalculationParameters = (state: {
  report: ReportState
}) => state.report.taxCalculationParameters.data
