import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

// APIレスポンスの型定義
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

export interface ReportState {
  expenseBreakdownByMonth: {
    data: MonthlyBreakdownItem[] | null
    loading: boolean
    error: string | null
  }
  expenseBreakdownByYear: {
    data: YearlyBreakdownItem[] | null
    loading: boolean
    error: string | null
  }
  assetBreakdownByMonth: {
    data: MonthlyBreakdownItem[] | null
    loading: boolean
    error: string | null
  }
  assetBreakdownByYear: {
    data: YearlyBreakdownItem[] | null
    loading: boolean
    error: string | null
  }
  incomeBreakdownByMonth: {
    data: MonthlyBreakdownItem[] | null
    loading: boolean
    error: string | null
  }
  incomeBreakdownByYear: {
    data: YearlyBreakdownItem[] | null
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
  assetBreakdownByMonth: {
    data: null,
    loading: false,
    error: null,
  },
  assetBreakdownByYear: {
    data: null,
    loading: false,
    error: null,
  },
  incomeBreakdownByMonth: {
    data: null,
    loading: false,
    error: null,
  },
  incomeBreakdownByYear: {
    data: null,
    loading: false,
    error: null,
  },
}

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

export const fetchAssetBreakdownByMonth = createAsyncThunk(
  'report/fetchAssetBreakdownByMonth',
  async (fiscalYear: string) => {
    const response = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/breakdown/asset-by-month`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch asset breakdown by month')
    }
    return response.json()
  },
)

export const fetchAssetBreakdownByYear = createAsyncThunk(
  'report/fetchAssetBreakdownByYear',
  async (fiscalYear: string) => {
    const response = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/breakdown/asset-by-year`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch asset breakdown by year')
    }
    return response.json()
  },
)

export const fetchIncomeBreakdownByMonth = createAsyncThunk(
  'report/fetchIncomeBreakdownByMonth',
  async (fiscalYear: string) => {
    const response = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/breakdown/income-by-month`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch income breakdown by month')
    }
    return response.json()
  },
)

export const fetchIncomeBreakdownByYear = createAsyncThunk(
  'report/fetchIncomeBreakdownByYear',
  async (fiscalYear: string) => {
    const response = await fetch(
      `/api/fiscal-years/${fiscalYear}/reports/breakdown/income-by-year`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch income breakdown by year')
    }
    return response.json()
  },
)

export const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearExpenseBreakdownByMonth: (state) => {
      state.expenseBreakdownByMonth = initialState.expenseBreakdownByMonth
    },
    clearExpenseBreakdownByYear: (state) => {
      state.expenseBreakdownByYear = initialState.expenseBreakdownByYear
    },
    clearAssetBreakdownByMonth: (state) => {
      state.assetBreakdownByMonth = initialState.assetBreakdownByMonth
    },
    clearAssetBreakdownByYear: (state) => {
      state.assetBreakdownByYear = initialState.assetBreakdownByYear
    },
    clearIncomeBreakdownByMonth: (state) => {
      state.incomeBreakdownByMonth = initialState.incomeBreakdownByMonth
    },
    clearIncomeBreakdownByYear: (state) => {
      state.incomeBreakdownByYear = initialState.incomeBreakdownByYear
    },
  },
  extraReducers: (builder) => {
    // 費用の月別集計
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

    // 費用の年別集計
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

    // 資産の月別集計
    builder
      .addCase(fetchAssetBreakdownByMonth.pending, (state) => {
        state.assetBreakdownByMonth.loading = true
        state.assetBreakdownByMonth.error = null
      })
      .addCase(fetchAssetBreakdownByMonth.fulfilled, (state, action) => {
        state.assetBreakdownByMonth.loading = false
        state.assetBreakdownByMonth.data = action.payload.data
      })
      .addCase(fetchAssetBreakdownByMonth.rejected, (state, action) => {
        state.assetBreakdownByMonth.loading = false
        state.assetBreakdownByMonth.error =
          action.error.message || 'Unknown error'
      })

    // 資産の年別集計
    builder
      .addCase(fetchAssetBreakdownByYear.pending, (state) => {
        state.assetBreakdownByYear.loading = true
        state.assetBreakdownByYear.error = null
      })
      .addCase(fetchAssetBreakdownByYear.fulfilled, (state, action) => {
        state.assetBreakdownByYear.loading = false
        state.assetBreakdownByYear.data = action.payload.data
      })
      .addCase(fetchAssetBreakdownByYear.rejected, (state, action) => {
        state.assetBreakdownByYear.loading = false
        state.assetBreakdownByYear.error =
          action.error.message || 'Unknown error'
      })

    // 収入の月別集計
    builder
      .addCase(fetchIncomeBreakdownByMonth.pending, (state) => {
        state.incomeBreakdownByMonth.loading = true
        state.incomeBreakdownByMonth.error = null
      })
      .addCase(fetchIncomeBreakdownByMonth.fulfilled, (state, action) => {
        state.incomeBreakdownByMonth.loading = false
        state.incomeBreakdownByMonth.data = action.payload.data
      })
      .addCase(fetchIncomeBreakdownByMonth.rejected, (state, action) => {
        state.incomeBreakdownByMonth.loading = false
        state.incomeBreakdownByMonth.error =
          action.error.message || 'Unknown error'
      })

    // 収入の年別集計
    builder
      .addCase(fetchIncomeBreakdownByYear.pending, (state) => {
        state.incomeBreakdownByYear.loading = true
        state.incomeBreakdownByYear.error = null
      })
      .addCase(fetchIncomeBreakdownByYear.fulfilled, (state, action) => {
        state.incomeBreakdownByYear.loading = false
        state.incomeBreakdownByYear.data = action.payload.data
      })
      .addCase(fetchIncomeBreakdownByYear.rejected, (state, action) => {
        state.incomeBreakdownByYear.loading = false
        state.incomeBreakdownByYear.error =
          action.error.message || 'Unknown error'
      })
  },
})

export const {
  clearExpenseBreakdownByMonth,
  clearExpenseBreakdownByYear,
  clearAssetBreakdownByMonth,
  clearAssetBreakdownByYear,
  clearIncomeBreakdownByMonth,
  clearIncomeBreakdownByYear,
} = reportSlice.actions

export default reportSlice.reducer

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

export const selectAssetBreakdownByMonth = (state: { report: ReportState }) =>
  state.report.assetBreakdownByMonth.data

export const selectAssetBreakdownByMonthLoading = (state: {
  report: ReportState
}) => state.report.assetBreakdownByMonth.loading

export const selectAssetBreakdownByYear = (state: { report: ReportState }) =>
  state.report.assetBreakdownByYear.data

export const selectAssetBreakdownByYearLoading = (state: {
  report: ReportState
}) => state.report.assetBreakdownByYear.loading

export const selectIncomeBreakdownByMonth = (state: { report: ReportState }) =>
  state.report.incomeBreakdownByMonth.data

export const selectIncomeBreakdownByMonthLoading = (state: {
  report: ReportState
}) => state.report.incomeBreakdownByMonth.loading

export const selectIncomeBreakdownByYear = (state: { report: ReportState }) =>
  state.report.incomeBreakdownByYear.data

export const selectIncomeBreakdownByYearLoading = (state: {
  report: ReportState
}) => state.report.incomeBreakdownByYear.loading
