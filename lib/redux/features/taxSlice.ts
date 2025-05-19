import {
  type PayloadAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'

import type { RootState } from '@/lib/redux/store'

// 税金データの型定義
interface TaxData {
  id: string
  year: string
  totalTax: number
  corporateTax: number
  incomeTax: number
  consumptionTax: number
}

// 状態の型定義
interface TaxState {
  taxData: TaxData[]
  selectedYear: string | null
  loading: boolean
  error: string | null
}

// 初期状態
const initialState: TaxState = {
  taxData: [],
  selectedYear: null,
  loading: false,
  error: null,
}

// 非同期アクション - 税金データの取得
export const fetchTaxData = createAsyncThunk(
  'tax/fetchTaxData',
  async (year: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tax-simulation/${year}`)
      if (!response.ok) {
        throw new Error('サーバーエラーが発生しました')
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '不明なエラーが発生しました',
      )
    }
  },
)

// スライスの作成
export const taxSlice = createSlice({
  name: 'tax',
  initialState,
  reducers: {
    // 年度の選択
    selectYear: (state, action: PayloadAction<string>) => {
      state.selectedYear = action.payload
    },
    // 選択解除
    clearSelectedYear: (state) => {
      state.selectedYear = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaxData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTaxData.fulfilled, (state, action) => {
        state.loading = false
        state.taxData = action.payload
      })
      .addCase(fetchTaxData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

// アクションのエクスポート
export const { selectYear, clearSelectedYear } = taxSlice.actions

// セレクターのエクスポート
export const selectAllTaxData = (state: RootState) => state.tax.taxData
export const selectSelectedYear = (state: RootState) => state.tax.selectedYear
export const selectTaxLoading = (state: RootState) => state.tax.loading
export const selectTaxError = (state: RootState) => state.tax.error

// リデューサーのエクスポート
export default taxSlice.reducer
