import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'

import { RootState } from '@/lib/redux/store'

export interface PayrollItem {
  code: string
  name: string
  amount: number
}

export interface PayrollSummary {
  month: string
  payroll_base: number
  payroll_deduction: PayrollItem[]
  payroll_addition: PayrollItem[]
  net_payment: number
}

export interface PayrollState {
  summaries: PayrollSummary[]
  loading: boolean
  error: string | null
}

const initialState: PayrollState = {
  summaries: [],
  loading: false,
  error: null,
}

export const fetchPayrollSummary = createAsyncThunk<
  PayrollSummary[] | { data: PayrollSummary[] },
  string
>('payroll/fetchPayrollSummary', async (fiscalYear: string) => {
  const response = await fetch(`/api/fiscal-years/${fiscalYear}/reports/payroll-summary`)
  
  if (!response.ok) {
    throw new Error('給与データの取得に失敗しました')
  }
  
  return response.json()
})

export const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    clearData: (state) => {
      state.summaries = []
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrollSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPayrollSummary.fulfilled, (state, action) => {
        state.loading = false
        state.summaries = Array.isArray(action.payload) ? action.payload : (action.payload as { data: PayrollSummary[] }).data || []
      })
      .addCase(fetchPayrollSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Unknown error'
      })
  },
})

export const { clearData } = payrollSlice.actions

export default payrollSlice.reducer

export const selectPayrollSummary = createSelector(
  [
    (state: RootState) => state.payroll.summaries,
    (state: RootState) => state.payroll.loading,
    (state: RootState) => state.payroll.error,
  ],
  (summaries, loading, error) => ({ summaries, loading, error }),
)