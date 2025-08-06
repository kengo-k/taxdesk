import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'

import {
  AnnualBreakdown,
  BreakdownRequest,
  MonthlyBreakdown,
} from '@/lib/backend/services/reports/calculate-breakdown'
import { selectTaxParameters } from '@/lib/client/tax-calculation/parameters'
import { KAMOKU_BUNRUI } from '@/lib/constants/kamoku-bunrui'
import { RootState } from '@/lib/redux/store'

export interface ReportState {
  // 内訳データ用の状態
  dashboard: {
    saimokuNetAssetsByYear: AnnualBreakdown[] | null
    saimokuNetRevenuesByYear: AnnualBreakdown[] | null
    saimokuNetExpensesByYear: AnnualBreakdown[] | null
    saimokuNetRevenuesByMonth: MonthlyBreakdown[] | null
    saimokuNetExpensesByMonth: MonthlyBreakdown[] | null
  }
  dashboardLoading: boolean
  dashboardError: string | null
  taxCalculationParameters: AnnualBreakdown[][]
  taxCalculationParametersLoading: boolean
  taxCalculationParametersError: string | null
}

const initialState: ReportState = {
  // 内訳データ用の初期状態
  dashboard: {
    saimokuNetAssetsByYear: null,
    saimokuNetRevenuesByYear: null,
    saimokuNetExpensesByYear: null,
    saimokuNetRevenuesByMonth: null,
    saimokuNetExpensesByMonth: null,
  },
  dashboardLoading: false,
  dashboardError: null,

  taxCalculationParameters: [],
  taxCalculationParametersLoading: false,
  taxCalculationParametersError: null,
}

export const fetchTaxCalculationParameters = createAsyncThunk<
  {
    data: {
      annual: { request: BreakdownRequest; response: AnnualBreakdown[] }[]
      monthly: { request: BreakdownRequest; response: MonthlyBreakdown[] }[]
    }
  },
  string
>('report/fetchTaxCalculationParameters', async (fiscalYear: string) => {
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

  return await response.json()
})

export const fetchDashboardData = createAsyncThunk<
  {
    data: {
      annual: { request: BreakdownRequest; response: AnnualBreakdown[] }[]
      monthly: { request: BreakdownRequest; response: MonthlyBreakdown[] }[]
    }
  },
  string
>('report/fetchDashboardData', async (fiscalYear: string) => {
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

  return await response.json()
})

export const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearData: (state) => {
      state.dashboard.saimokuNetAssetsByYear = null
      state.dashboard.saimokuNetRevenuesByYear = null
      state.dashboard.saimokuNetExpensesByYear = null
      state.dashboard.saimokuNetRevenuesByMonth = null
      state.dashboard.saimokuNetExpensesByMonth = null
      state.dashboardLoading = false
      state.dashboardError = null

      state.taxCalculationParameters = []
      state.taxCalculationParametersLoading = false
      state.taxCalculationParametersError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaxCalculationParameters.pending, (state) => {
        state.taxCalculationParametersLoading = true
        state.taxCalculationParametersError = null
      })
      .addCase(fetchTaxCalculationParameters.fulfilled, (state, action) => {
        state.taxCalculationParametersLoading = false
        state.taxCalculationParameters = action.payload.data.annual.map(
          (item) => item.response,
        )
      })
      .addCase(fetchTaxCalculationParameters.rejected, (state, action) => {
        state.taxCalculationParametersLoading = false
        state.taxCalculationParametersError =
          action.error.message || 'Unknown error'
      })

    // Dashboard data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.dashboardLoading = true
        state.dashboardError = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        const { annual, monthly } = action.payload.data

        // Set loading to false for all states
        state.dashboardLoading = false

        // Update data for each state
        state.dashboard.saimokuNetAssetsByYear = annual[0].response
        state.dashboard.saimokuNetRevenuesByYear = annual[1].response
        state.dashboard.saimokuNetExpensesByYear = annual[2].response
        state.dashboard.saimokuNetRevenuesByMonth = monthly[0].response
        state.dashboard.saimokuNetExpensesByMonth = monthly[1].response
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        const error = action.error.message || 'Unknown error'
        state.dashboardLoading = false
        state.dashboardError = error
      })
  },
})

export const { clearData } = reportSlice.actions

export default reportSlice.reducer

export const selectDashboard = createSelector(
  [
    (state: RootState) => state.report.dashboard,
    (state: RootState) => state.report.dashboardLoading,
    (state: RootState) => state.report.dashboardError,
  ],
  (data, loading, error) => ({ data, loading, error }),
)

export const selectTaxCalculationParameters = createSelector(
  [
    (state: RootState) => state.report.taxCalculationParameters,
    (state: RootState) => state.report.taxCalculationParametersLoading,
    (state: RootState) => state.report.taxCalculationParametersError,
  ],
  (data, loading, error) => ({ data, loading, error }),
)
