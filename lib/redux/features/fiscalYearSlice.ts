import {
  type PayloadAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'

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
interface FiscalYearState {
  fiscalYears: FiscalYear[]
  selectedYear: string | null
  loading: boolean
  error: string | null
}

// 初期状態
const initialState: FiscalYearState = {
  fiscalYears: [],
  selectedYear: 'none',
  loading: false,
  error: null,
}

// 非同期アクション - 年度一覧の取得
export const fetchFiscalYears = createAsyncThunk(
  'fiscalYear/fetchFiscalYears',
  async (_, { rejectWithValue }) => {
    try {
      // APIエンドポイントを直接呼び出す
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

// スライスの作成
export const fiscalYearSlice = createSlice({
  name: 'fiscalYear',
  initialState,
  reducers: {
    // 年度の選択
    selectFiscalYear: (state, action: PayloadAction<string>) => {
      state.selectedYear = action.payload
    },
    // 選択解除
    clearSelectedFiscalYear: (state) => {
      state.selectedYear = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiscalYears.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchFiscalYears.fulfilled,
        (state, action: PayloadAction<FiscalYear[]>) => {
          state.loading = false
          state.fiscalYears = action.payload

          // 現在の年度を初期選択
          const currentYear = action.payload.find((year) => year.isCurrent)
          if (currentYear && !state.selectedYear) {
            state.selectedYear = currentYear.id
          }
        },
      )
      .addCase(fetchFiscalYears.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// アクションのエクスポート
export const { selectFiscalYear, clearSelectedFiscalYear } =
  fiscalYearSlice.actions

// セレクターのエクスポート
export const selectAllFiscalYears = (state: RootState) =>
  state.fiscalYear.fiscalYears
export const selectSelectedFiscalYearId = (state: RootState) =>
  state.fiscalYear.selectedYear
export const selectFiscalYearLoading = (state: RootState) =>
  state.fiscalYear.loading
export const selectFiscalYearError = (state: RootState) =>
  state.fiscalYear.error
export const selectCurrentFiscalYear = (state: RootState) =>
  state.fiscalYear.fiscalYears.find(
    (year) => year.id === state.fiscalYear.selectedYear,
  )

// リデューサーのエクスポート
export default fiscalYearSlice.reducer
