import {
  type PayloadAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'

import { ListAccountItem } from '@/lib/backend/services/masters/list-accounts'
import type { RootState } from '@/lib/redux/store'

// 年度の型定義
export interface FiscalYear {
  id: string
  label: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

// 状態の型定義
interface MasterState {
  // Fiscal Year related state
  fiscalYears: FiscalYear[]
  selectedYear: string
  fiscalYearLoading: boolean
  fiscalYearError: string | null

  // Account related state
  accountList: ListAccountItem[]
  selectedAccountId: string | null
  accountLoading: boolean
  accountError: string | null
}

// 初期状態
const initialState: MasterState = {
  // Fiscal Year initial state
  fiscalYears: [],
  selectedYear: 'none',
  fiscalYearLoading: false,
  fiscalYearError: null,

  // Account initial state
  accountList: [],
  selectedAccountId: null,
  accountLoading: false,
  accountError: null,
}

// 非同期アクション - 年度一覧の取得
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

// 非同期アクション - 勘定科目一覧の取得
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

// スライスの作成
export const masterSlice = createSlice({
  name: 'master',
  initialState,
  reducers: {
    // Fiscal Year actions
    selectFiscalYear: (state, action: PayloadAction<string>) => {
      state.selectedYear = action.payload
    },
    clearSelectedFiscalYear: (state) => {
      state.selectedYear = 'none'
    },

    // Account actions
    selectAccount: (state, action: PayloadAction<string>) => {
      state.selectedAccountId = action.payload
    },
    clearSelectedAccount: (state) => {
      state.selectedAccountId = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fiscal Year reducers
      .addCase(fetchFiscalYears.pending, (state) => {
        state.fiscalYearLoading = true
        state.fiscalYearError = null
      })
      .addCase(
        fetchFiscalYears.fulfilled,
        (state, action: PayloadAction<FiscalYear[]>) => {
          state.fiscalYearLoading = false
          state.fiscalYears = action.payload

          // 現在の年度を初期選択
          const currentYear = action.payload.find((year) => year.isCurrent)
          if (currentYear && !state.selectedYear) {
            state.selectedYear = currentYear.id
          }
        },
      )
      .addCase(fetchFiscalYears.rejected, (state, action) => {
        state.fiscalYearLoading = false
        state.fiscalYearError = action.payload as string
      })

      // Account reducers
      .addCase(fetchAccountList.pending, (state) => {
        state.accountLoading = true
        state.accountError = null
      })
      .addCase(fetchAccountList.fulfilled, (state, action) => {
        state.accountLoading = false
        state.accountList = action.payload.data
      })
      .addCase(fetchAccountList.rejected, (state, action) => {
        state.accountLoading = false
        state.accountError = action.payload as string
      })
  },
})

// アクションのエクスポート
export const {
  selectFiscalYear,
  clearSelectedFiscalYear,
  selectAccount,
  clearSelectedAccount,
} = masterSlice.actions

// セレクターのエクスポート
// Fiscal Year selectors
export const selectAllFiscalYears = (state: RootState) =>
  state.master.fiscalYears
export const selectSelectedFiscalYearId = (state: RootState) =>
  state.master.selectedYear
export const selectFiscalYearLoading = (state: RootState) =>
  state.master.fiscalYearLoading
export const selectFiscalYearError = (state: RootState) =>
  state.master.fiscalYearError
export const selectCurrentFiscalYear = (state: RootState) =>
  state.master.fiscalYears.find((year) => year.id === state.master.selectedYear)

// Account selectors
export const selectAllAccountList = (state: RootState) =>
  state.master.accountList
export const selectSelectedAccountId = (state: RootState) =>
  state.master.selectedAccountId
export const selectAccountListLoading = (state: RootState) =>
  state.master.accountLoading
export const selectAccountListError = (state: RootState) =>
  state.master.accountError

// リデューサーのエクスポート
export default masterSlice.reducer
