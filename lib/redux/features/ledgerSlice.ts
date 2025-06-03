import {
  type PayloadAction,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'

import { DeleteJournalsRequest } from '@/lib/backend/services/journal/delete-journals'
import { UpdateJournalCheckedRequest } from '@/lib/backend/services/journal/update-journal-checked'
import { CountByAccountItem } from '@/lib/backend/services/ledger/count-by-account'
import { CreateLedgerRequest } from '@/lib/backend/services/ledger/create-ledger'
import { LedgerListItem } from '@/lib/backend/services/ledger/list-ledgers'
import { UpdateLedgerRequest } from '@/lib/backend/services/ledger/update-ledger'
import type { RootState } from '@/lib/redux/store'

export interface PaginationInfo {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface TransactionSearchParams {
  nendo: string
  code: string | null
  month: string | null
  checked: string | null // '0'=未確認, '1'=確認済み, null=指定なし
  note: string | null // 摘要（部分一致検索）
  page: number
  pageSize: number
}

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

export const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    updateSearchParams: (
      state,
      action: PayloadAction<Partial<TransactionSearchParams>>,
    ) => {
      state.searchParams = { ...state.searchParams, ...action.payload }
    },
    clearTransactions: (state) => {
      state.transactions = []
      state.all_count = 0
    },
    setShowTooltip: (
      state,
      action: PayloadAction<{ id: number; field: 'date' | 'debit' | 'credit' }>,
    ) => {
      const { id, field } = action.payload
      const index = state.transactions.findIndex(
        (transaction) => transaction.journal_id === id,
      )
    },
    setSelectedRows: (state, action: PayloadAction<string[]>) => {},
    deleteTransactions: (state, action: PayloadAction<string[]>) => {
      const idsToDelete = action.payload
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

export const {
  updateSearchParams,
  setShowTooltip,
  setSelectedRows,
  clearTransactions,
} = transactionSlice.actions

export const selectTransactions = (state: RootState) =>
  state.ledger.transactions
export const selectAllCount = (state: RootState) => state.ledger.all_count
export const selectPagination = (state: RootState) => state.ledger.pagination
export const selectLedgerLoading = (state: RootState) => state.ledger.loading
export const selectLedgerError = (state: RootState) => state.ledger.error
export const selectSearchParams = (state: RootState) =>
  state.ledger.searchParams
export const selectAccountCounts = (state: RootState) =>
  state.ledger.accountCounts
export const selectAccountCountsLoading = (state: RootState) =>
  state.ledger.accountCountsLoading
export const selectAccountCountsError = (state: RootState) =>
  state.ledger.accountCountsError

export default transactionSlice.reducer
