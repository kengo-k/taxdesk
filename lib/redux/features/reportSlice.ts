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
  // 既存の状態
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
  // 既存の初期状態
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

// 既存のThunkアクション
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
    // 既存のクリアアクション
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

    // 既存のReducers
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
  // 汎用API用のクリアアクション
  clearGenericAssetByYear,
  clearGenericRevenueByYear,
  clearGenericExpenseByYear,
  clearGenericRevenueByMonth,
  clearGenericExpenseByMonth,
  // 既存のクリアアクション
  clearExpenseBreakdownByMonth,
  clearExpenseBreakdownByYear,
  clearAssetBreakdownByMonth,
  clearAssetBreakdownByYear,
  clearIncomeBreakdownByMonth,
  clearIncomeBreakdownByYear,
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

// 既存のセレクター
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
