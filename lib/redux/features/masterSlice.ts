import {
  type PayloadAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'

import { ListAccountItem } from '@/lib/backend/services/masters/list-accounts'
import type { RootState } from '@/lib/redux/store'

export interface FiscalYear {
  id: string
  label: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

interface MasterState {
  fiscalYears: FiscalYear[]
  fiscalYearsLoading: boolean
  fiscalYearsError: string | null

  selectedYear: string

  accountList: ListAccountItem[]
  accountListLoading: boolean
  accountListError: string | null
}

// 初期状態
const initialState: MasterState = {
  fiscalYears: [],
  fiscalYearsLoading: false,
  fiscalYearsError: null,

  selectedYear: 'none',

  accountList: [],
  accountListLoading: false,
  accountListError: null,
}

export const fetchFiscalYears = createAsyncThunk(
  'master/fetchFiscalYears',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/master/fiscal-years')
      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`)
      }
      const data = await response.json()
      if (data.success && Array.isArray(data.data)) {
        return data.data
      } else {
        throw new Error('APIからの応答が不正です')
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : '年度一覧の取得中にエラーが発生しました',
      )
    }
  },
)

export const fetchAccountList = createAsyncThunk<
  { data: ListAccountItem[] },
  string
>(
  'master/fetchAccountList',
  async (fiscalYear: string, { rejectWithValue }) => {
    try {
      let url = `/api/fiscal-years/${fiscalYear}/accounts`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('サーバーエラーが発生しました')
      }
      return await response.json()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '不明なエラーが発生しました',
      )
    }
  },
)

export const masterSlice = createSlice({
  name: 'master',
  initialState,
  reducers: {
    setSelectedFiscalYear: (state, action: PayloadAction<string>) => {
      state.selectedYear = action.payload
    },
    clearSelectedFiscalYear: (state) => {
      state.selectedYear = 'none'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiscalYears.pending, (state) => {
        state.fiscalYearsLoading = true
        state.fiscalYearsError = null
      })
      .addCase(
        fetchFiscalYears.fulfilled,
        (state, action: PayloadAction<FiscalYear[]>) => {
          state.fiscalYearsLoading = false
          state.fiscalYears = action.payload

          const currentYear = action.payload.find((year) => year.isCurrent)
          if (currentYear && !state.selectedYear) {
            state.selectedYear = currentYear.id
          }
        },
      )
      .addCase(fetchFiscalYears.rejected, (state, action) => {
        state.fiscalYearsLoading = false
        state.fiscalYearsError = action.payload as string
      })

      .addCase(fetchAccountList.pending, (state) => {
        state.accountListLoading = true
        state.accountListError = null
      })
      .addCase(fetchAccountList.fulfilled, (state, action) => {
        state.accountListLoading = false
        state.accountList = action.payload.data
      })
      .addCase(fetchAccountList.rejected, (state, action) => {
        state.accountListLoading = false
        state.accountListError = action.payload as string
      })
  },
})

export const { setSelectedFiscalYear, clearSelectedFiscalYear } =
  masterSlice.actions

export const selectSelectedFiscalYear = (state: RootState) =>
  state.master.selectedYear

export const selectFiscalYears = (state: RootState) => ({
  data: state.master.fiscalYears,
  loading: state.master.fiscalYearsLoading,
  error: state.master.fiscalYearsError,
})

export const selectAccountList = (state: RootState) => ({
  data: state.master.accountList,
  loading: state.master.accountListLoading,
  error: state.master.accountListError,
})

export default masterSlice.reducer
