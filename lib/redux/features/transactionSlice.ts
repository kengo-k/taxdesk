import type { RootState } from '../store'

import {
  type PayloadAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'

import { DeleteJournalsRequest } from '@/lib/services/journal/delete-journals'
import { UpdateJournalCheckedRequest } from '@/lib/services/journal/update-journal-checked'
import { CountByAccountItem } from '@/lib/services/ledger/count-by-account'
import { CreateLedgerRequest } from '@/lib/services/ledger/create-ledger'
import { LedgerListItem } from '@/lib/services/ledger/list-ledgers'
import { UpdateLedgerRequest } from '@/lib/services/ledger/update-ledger'

// 取引データの型定義
export interface Transaction {
  id: string
  date: string
  accountCode: string
  counterpartyAccount: string
  description: string
  debit: number
  credit: number
  summary: string
  balance: number
}

// エラー状態の型定義
export interface ValidationErrors {
  date?: string
  debit?: string
  credit?: string
}

// 取引とそのエラー状態を組み合わせた型
export interface TransactionWithErrors extends Transaction {
  errors: ValidationErrors
  showTooltips: {
    date: boolean
    debit: boolean
    credit: boolean
  }
}

// ページネーション情報の型定義
export interface PaginationInfo {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

// APIレスポンスの型定義
interface ApiResponse {
  transactions: Transaction[]
  pagination: PaginationInfo
}

// 検索条件の型定義
export interface TransactionSearchParams {
  nendo: string
  code: string | null
  month: string | null
  checked: string | null // '0'=未確認, '1'=確認済み, null=指定なし
  note: string | null // 摘要（部分一致検索）
  page: number
  pageSize: number
}

// 勘定科目別レコード件数の型定義
export interface AccountCount {
  accountCode: string
  accountName: string
  count: number
}

// 状態の型定義
interface TransactionState {
  transactions: LedgerListItem[]
  all_count: number
  pagination: PaginationInfo
  loading: boolean
  error: string | null
  searchParams: TransactionSearchParams
  accountCounts: CountByAccountItem[]
  accountCountsLoading: boolean
  accountCountsError: string | null
}

// 初期状態
const initialState: TransactionState = {
  transactions: [],
  all_count: 0,
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
  searchParams: {
    nendo: 'unset',
    code: null,
    month: null,
    checked: null,
    note: null,
    page: 1,
    pageSize: 10,
  },
  accountCounts: [],
  accountCountsLoading: false,
  accountCountsError: null,
}

// 非同期アクション - 取引データの取得
export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  async (params: TransactionSearchParams, { rejectWithValue }) => {
    try {
      // URLパラメータを構築
      const urlParams = new URLSearchParams()

      if (params.month) {
        urlParams.set('month', params.month)
      }
      if (params.checked) {
        urlParams.set('checked', params.checked)
      }
      if (params.note) {
        urlParams.set('note', params.note)
      }
      urlParams.set('pageno', params.page.toString())
      urlParams.set('pagesize', params.pageSize.toString())

      // APIリクエスト
      const url = `/api/fiscal-years/${params.nendo}/ledger/${params.code}${urlParams.size > 0 ? `?${urlParams.toString()}` : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : '取引データの取得中にエラーが発生しました',
      )
    }
  },
)

// 非同期アクション - 勘定科目別レコード件数の取得
export const fetchAccountCounts = createAsyncThunk<
  { data: CountByAccountItem[] },
  string
>(
  'transaction/fetchAccountCounts',
  async (nendo: string, { rejectWithValue }) => {
    try {
      // APIリクエスト
      const url = `/api/fiscal-years/${nendo}/ledger/counts/by-account`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : '勘定科目別レコード件数の取得中にエラーが発生しました',
      )
    }
  },
)

// 非同期アクション - 取引データの作成
export const createTransaction = createAsyncThunk<
  { data: LedgerListItem },
  CreateLedgerRequest
>(
  'transaction/createTransaction',
  async (transaction: CreateLedgerRequest, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/fiscal-years/${transaction.nendo}/ledger/${transaction.ledger_cd}`,
        {
          method: 'POST',
          body: JSON.stringify(transaction),
        },
      )

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : '取引データの作成中にエラーが発生しました',
      )
    }
  },
)

// 非同期アクション - 取引データの更新
export const updateTransaction = createAsyncThunk<
  { data: LedgerListItem },
  UpdateLedgerRequest
>(
  'transaction/updateTransaction',
  async (transaction: UpdateLedgerRequest, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/fiscal-years/${transaction.nendo}/ledger/${transaction.ledger_cd}`,
        {
          method: 'PUT',
          body: JSON.stringify(transaction),
        },
      )

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : '取引データの作成中にエラーが発生しました',
      )
    }
  },
)

// 非同期アクション - 取引データの確認状態更新
export const updateJournalChecked = createAsyncThunk<
  { success: boolean; message: string },
  UpdateJournalCheckedRequest
>('transaction/updateJournalChecked', async (request, { rejectWithValue }) => {
  try {
    const response = await fetch(
      `/api/fiscal-years/${request.fiscal_year}/journal/checked`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: request.id,
          checked: request.checked,
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`APIエラー: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : '取引データの確認状態更新中にエラーが発生しました',
    )
  }
})

// 非同期アクション - 取引データの削除
export const deleteTransactions = createAsyncThunk<
  { data: { deletedIds: string[] } },
  DeleteJournalsRequest
>('transaction/deleteTransactions', async (request, { rejectWithValue }) => {
  try {
    const response = await fetch(
      `/api/fiscal-years/${request.fiscal_year}/journal`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: request.ids }),
      },
    )

    if (!response.ok) {
      throw new Error(`APIエラー: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : '取引データの削除中にエラーが発生しました',
    )
  }
})

// スライスの作成
export const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    // 検索条件の更新
    updateSearchParams: (
      state,
      action: PayloadAction<Partial<TransactionSearchParams>>,
    ) => {
      state.searchParams = { ...state.searchParams, ...action.payload }
    },
    // 取引データのクリア
    clearTransactions: (state) => {
      state.transactions = []
      state.all_count = 0
    },
    // フォーカスが外れた時のエラー表示
    setShowTooltip: (
      state,
      action: PayloadAction<{ id: number; field: 'date' | 'debit' | 'credit' }>,
    ) => {
      const { id, field } = action.payload
      const index = state.transactions.findIndex(
        (transaction) => transaction.journal_id === id,
      )

      // if (index !== -1 && state.transactions[index].errors[field]) {
      //   state.transactions[index].showTooltips[field] = true
      // }
    },
    // 選択行の管理
    setSelectedRows: (state, action: PayloadAction<string[]>) => {
      // 選択行はUIの状態なのでReduxで管理しない場合もある
      // ここでは例として実装
    },
    // 取引の削除
    deleteTransactions: (state, action: PayloadAction<string[]>) => {
      const idsToDelete = action.payload
      // state.transactions = state.transactions.filter(
      //   (transaction) => !idsToDelete.includes(transaction.id),
      // )
      state.pagination = {
        ...state.pagination,
        totalItems: state.pagination.totalItems - idsToDelete.length,
        totalPages: Math.ceil(
          (state.pagination.totalItems - idsToDelete.length) /
            state.pagination.pageSize,
        ),
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload.data.ledgers
        state.all_count = action.payload.data.all_count
        state.pagination = action.payload.pagination
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 勘定科目別レコード件数の取得状態を管理
      .addCase(fetchAccountCounts.pending, (state) => {
        state.accountCountsLoading = true
        state.accountCountsError = null
      })
      .addCase(fetchAccountCounts.fulfilled, (state, action) => {
        state.accountCountsLoading = false
        state.accountCounts = action.payload.data
      })
      .addCase(fetchAccountCounts.rejected, (state, action) => {
        state.accountCountsLoading = false
        state.accountCountsError = action.payload as string
      })
  },
})

// バリデーション関数
const validateDate = (date: string): string | undefined => {
  // 日付形式（YYYY/MM/DD）のチェック
  const datePattern = /^\d{4}\/\d{1,2}\/\d{1,2}$/
  if (!datePattern.test(date)) {
    return '日付はYYYY/MM/DD形式で入力してください'
  }

  // 有効な日付かチェック
  const parts = date.split('/')
  const year = Number.parseInt(parts[0], 10)
  const month = Number.parseInt(parts[1], 10) - 1 // JavaScriptの月は0始まり
  const day = Number.parseInt(parts[2], 10)
  const dateObj = new Date(year, month, day)

  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month ||
    dateObj.getDate() !== day ||
    year < 1900 ||
    year > 2100
  ) {
    return '有効な日付を入力してください'
  }

  return undefined
}

const validateAmount = (amount: string): string | undefined => {
  if (amount === '') return undefined // 空の場合はエラーなし

  // カンマを削除して数値チェック
  const numericValue = amount.replace(/,/g, '')
  if (!/^\d+$/.test(numericValue)) {
    return '数値のみ入力可能です'
  }

  return undefined
}

// アクションのエクスポート
export const {
  updateSearchParams,
  setShowTooltip,
  setSelectedRows,
  clearTransactions,
} = transactionSlice.actions

// セレクターのエクスポート
export const selectTransactions = (state: RootState) =>
  state.transaction.transactions
export const selectAllCount = (state: RootState) => state.transaction.all_count
export const selectPagination = (state: RootState) =>
  state.transaction.pagination
export const selectTransactionLoading = (state: RootState) =>
  state.transaction.loading
export const selectTransactionError = (state: RootState) =>
  state.transaction.error
export const selectSearchParams = (state: RootState) =>
  state.transaction.searchParams
export const selectAccountCounts = (state: RootState) =>
  state.transaction.accountCounts
export const selectAccountCountsLoading = (state: RootState) =>
  state.transaction.accountCountsLoading
export const selectAccountCountsError = (state: RootState) =>
  state.transaction.accountCountsError

// リデューサーのエクスポート
export default transactionSlice.reducer
