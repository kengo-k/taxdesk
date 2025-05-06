import {
  type PayloadAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'

import type { RootState } from '@/lib/redux/store'
import { ListAccountItem } from '@/lib/services/masters/list-accounts'

// 状態の型定義
interface AccountState {
  accountList: ListAccountItem[]
  selectedAccountId: string | null
  loadingList: boolean
  errorList: string | null
}

// 初期状態
const initialState: AccountState = {
  accountList: [],
  selectedAccountId: null,
  loadingList: false,
  errorList: null,
}

// 非同期アクション - 勘定科目一覧の取得
export const fetchAccountList = createAsyncThunk<
  { data: ListAccountItem[] },
  string
>(
  'account/fetchAccountList',
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
export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    // 勘定科目の選択
    selectAccount: (state, action: PayloadAction<string>) => {
      state.selectedAccountId = action.payload
    },
    // 選択解除
    clearSelectedAccount: (state) => {
      state.selectedAccountId = null
    },
  },
  extraReducers: (builder) => {
    builder
      // 勘定科目一覧取得
      .addCase(fetchAccountList.pending, (state) => {
        state.loadingList = true
        state.errorList = null
      })
      .addCase(fetchAccountList.fulfilled, (state, action) => {
        state.loadingList = false
        state.accountList = action.payload.data
      })
      .addCase(fetchAccountList.rejected, (state, action) => {
        state.loadingList = false
        state.errorList = action.payload as string
      })
  },
})

// アクションのエクスポート
export const { selectAccount, clearSelectedAccount } = accountSlice.actions

// セレクターのエクスポート
export const selectAllAccountList = (state: RootState) =>
  state.account.accountList
export const selectSelectedAccountId = (state: RootState) =>
  state.account.selectedAccountId
export const selectAccountListLoading = (state: RootState) =>
  state.account.loadingList
export const selectAccountListError = (state: RootState) =>
  state.account.errorList

// リデューサーのエクスポート
export default accountSlice.reducer
