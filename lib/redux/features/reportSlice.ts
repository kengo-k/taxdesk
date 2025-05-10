import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { ExpenseBreakdownByMonthResponse } from '@/lib/services/reports/calc-expense-breakdown-by-month'
import { ExpenseBreakdownByYearResponse } from '@/lib/services/reports/calc-expense-breakdown-by-year'

interface ReportState {
  expenseBreakdownByMonth: {
    data: ExpenseBreakdownByMonthResponse[] | null
    loading: boolean
    error: string | null
  }
  expenseBreakdownByYear: {
    data: ExpenseBreakdownByYearResponse[] | null
    loading: boolean
    error: string | null
  }
}

const initialState: ReportState = {
  expenseBreakdownByMonth: {
    data: null,
    loading: false,
    error: null,
  },
  expenseBreakdownByYear: {
    data: null,
    loading: false,
    error: null,
  },
}

// 月別支出内訳の取得
export const fetchExpenseBreakdownByMonth = createAsyncThunk(
  'report/fetchExpenseBreakdownByMonth',
  async (fiscalYear: string) => {
    const response = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/breakdown/expense-by-month`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch expense breakdown by month')
    }
    return response.json()
  },
)

// 年度支出内訳の取得
export const fetchExpenseBreakdownByYear = createAsyncThunk(
  'report/fetchExpenseBreakdownByYear',
  async (fiscalYear: string) => {
    const response = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/breakdown/expense-by-year`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch expense breakdown by year')
    }
    return response.json()
  },
)

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearExpenseBreakdownByMonth: (state) => {
      state.expenseBreakdownByMonth = initialState.expenseBreakdownByMonth
    },
    clearExpenseBreakdownByYear: (state) => {
      state.expenseBreakdownByYear = initialState.expenseBreakdownByYear
    },
  },
  extraReducers: (builder) => {
    // 月別支出内訳の取得
    builder
      .addCase(fetchExpenseBreakdownByMonth.pending, (state) => {
        state.expenseBreakdownByMonth.loading = true
        state.expenseBreakdownByMonth.error = null
      })
      .addCase(fetchExpenseBreakdownByMonth.fulfilled, (state, action) => {
        state.expenseBreakdownByMonth.loading = false
        state.expenseBreakdownByMonth.data = action.payload.data
      })
      .addCase(fetchExpenseBreakdownByMonth.rejected, (state, action) => {
        state.expenseBreakdownByMonth.loading = false
        state.expenseBreakdownByMonth.error =
          action.error.message || 'Unknown error'
      })

    // 年度支出内訳の取得
    builder
      .addCase(fetchExpenseBreakdownByYear.pending, (state) => {
        state.expenseBreakdownByYear.loading = true
        state.expenseBreakdownByYear.error = null
      })
      .addCase(fetchExpenseBreakdownByYear.fulfilled, (state, action) => {
        state.expenseBreakdownByYear.loading = false
        state.expenseBreakdownByYear.data = action.payload.data
      })
      .addCase(fetchExpenseBreakdownByYear.rejected, (state, action) => {
        state.expenseBreakdownByYear.loading = false
        state.expenseBreakdownByYear.error =
          action.error.message || 'Unknown error'
      })
  },
})

// アクションのエクスポート
export const { clearExpenseBreakdownByMonth, clearExpenseBreakdownByYear } =
  reportSlice.actions

// セレクターのエクスポート
export const selectExpenseBreakdownByMonth = (state: { report: ReportState }) =>
  state.report.expenseBreakdownByMonth.data

export const selectExpenseBreakdownByMonthLoading = (state: {
  report: ReportState
}) => state.report.expenseBreakdownByMonth.loading

export const selectExpenseBreakdownByYear = (state: { report: ReportState }) =>
  state.report.expenseBreakdownByYear.data

export const selectExpenseBreakdownByYearLoading = (state: {
  report: ReportState
}) => state.report.expenseBreakdownByYear.loading

export default reportSlice.reducer
