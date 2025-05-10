import type { RootState } from '../store'

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { ExpenseBreakdownByMonthResponse } from '@/lib/services/reports/calc-expense-breakdown-by-month'

interface ReportState {
  expenseBreakdownByMonth: {
    data: ExpenseBreakdownByMonthResponse[]
    loading: boolean
    error: string | null
  }
}

const initialState: ReportState = {
  expenseBreakdownByMonth: {
    data: [],
    loading: false,
    error: null,
  },
}

// 月次支出内訳データを取得する非同期アクション
export const fetchExpenseBreakdownByMonth = createAsyncThunk(
  'report/fetchExpenseBreakdownByMonth',
  async (fiscalYear: string) => {
    const response = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/expense-breakdown/by-month`,
    )
    if (!response.ok) {
      throw new Error('月次支出内訳データの取得に失敗しました')
    }
    const data = await response.json()
    return data
  },
)

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    // 月次支出内訳データをクリアするアクション
    clearExpenseBreakdownByMonth: (state) => {
      state.expenseBreakdownByMonth = {
        data: [],
        loading: false,
        error: null,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 月次支出内訳データ取得開始
      .addCase(fetchExpenseBreakdownByMonth.pending, (state) => {
        state.expenseBreakdownByMonth = {
          data: [],
          loading: true,
          error: null,
        }
      })
      // 月次支出内訳データ取得成功
      .addCase(fetchExpenseBreakdownByMonth.fulfilled, (state, action) => {
        state.expenseBreakdownByMonth = {
          data: action.payload.data,
          loading: false,
          error: null,
        }
      })
      // 月次支出内訳データ取得失敗
      .addCase(fetchExpenseBreakdownByMonth.rejected, (state, action) => {
        state.expenseBreakdownByMonth = {
          data: [],
          loading: false,
          error:
            action.error.message || '月次支出内訳データの取得に失敗しました',
        }
      })
  },
})

// セレクター
export const selectExpenseBreakdownByMonth = (state: RootState) =>
  state.report.expenseBreakdownByMonth.data
export const selectExpenseBreakdownByMonthLoading = (state: RootState) =>
  state.report.expenseBreakdownByMonth.loading
export const selectExpenseBreakdownByMonthError = (state: RootState) =>
  state.report.expenseBreakdownByMonth.error

export const { clearExpenseBreakdownByMonth } = reportSlice.actions
export default reportSlice.reducer
