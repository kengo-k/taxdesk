import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'

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

export interface LedgerSearchParams {
  nendo: string
  code: string | null
  month: string | null
  checked: string | null // '0'=未確認, '1'=確認済み, null=指定なし
  note: string | null // 摘要（部分一致検索）
  page: number
  pageSize: number
}

interface LedgerState {
  ledgerList: LedgerListItem[]
  ledgerListCount: number
  ledgerListLoading: boolean
  ledgerListError: string | null

  accountCounts: CountByAccountItem[]
  accountCountsLoading: boolean
  accountCountsError: string | null
}

const initialState: LedgerState = {
  ledgerList: [],
  ledgerListCount: 0,
  ledgerListLoading: false,
  ledgerListError: null,

  accountCounts: [],
  accountCountsLoading: false,
  accountCountsError: null,
}

export const fetchLedgers = createAsyncThunk(
  'ledger/fetchLedgers',
  async (params: LedgerSearchParams, { rejectWithValue }) => {
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

export const fetchLedgerCountsByAccount = createAsyncThunk<
  { data: CountByAccountItem[] },
  string
>(
  'ledger/fetchLedgerCountsByAccount',
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

export const createLedger = createAsyncThunk<
  { data: LedgerListItem },
  CreateLedgerRequest
>(
  'ledger/createLedger',
  async (ledger: CreateLedgerRequest, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/fiscal-years/${ledger.nendo}/ledger/${ledger.ledger_cd}`,
        {
          method: 'POST',
          body: JSON.stringify(ledger),
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

export const updateLedger = createAsyncThunk<
  { data: LedgerListItem },
  UpdateLedgerRequest
>(
  'ledger/updateLedger',
  async (ledger: UpdateLedgerRequest, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/fiscal-years/${ledger.nendo}/ledger/${ledger.ledger_cd}`,
        {
          method: 'PUT',
          body: JSON.stringify(ledger),
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

export const updateLedgerChecked = createAsyncThunk<
  { success: boolean; message: string },
  UpdateJournalCheckedRequest
>('ledger/updateLedgerChecked', async (request, { rejectWithValue }) => {
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

export const deleteLedgers = createAsyncThunk<
  { data: { deletedIds: string[] } },
  DeleteJournalsRequest
>('ledger/deleteLedgers', async (request, { rejectWithValue }) => {
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

export const ledgerSlice = createSlice({
  name: 'ledger',
  initialState,
  reducers: {
    clearLedgers: (state) => {
      state.ledgerList = []
      state.ledgerListCount = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLedgers.pending, (state) => {
        state.ledgerListLoading = true
        state.ledgerListError = null
      })
      .addCase(fetchLedgers.fulfilled, (state, action) => {
        state.ledgerListLoading = false
        state.ledgerList = action.payload.data.ledgers
        state.ledgerListCount = action.payload.data.all_count
      })
      .addCase(fetchLedgers.rejected, (state, action) => {
        state.ledgerListLoading = false
        state.ledgerListError = action.payload as string
      })
      .addCase(fetchLedgerCountsByAccount.pending, (state) => {
        state.accountCountsLoading = true
        state.accountCountsError = null
      })
      .addCase(fetchLedgerCountsByAccount.fulfilled, (state, action) => {
        state.accountCountsLoading = false
        state.accountCounts = action.payload.data
      })
      .addCase(fetchLedgerCountsByAccount.rejected, (state, action) => {
        state.accountCountsLoading = false
        state.accountCountsError = action.payload as string
      })
  },
})

export const { clearLedgers } = ledgerSlice.actions

export const selectLedgerList = createSelector(
  [
    (state: RootState) => state.ledger.ledgerList,
    (state: RootState) => state.ledger.ledgerListCount,
    (state: RootState) => state.ledger.ledgerListLoading,
    (state: RootState) => state.ledger.ledgerListError,
  ],
  (list, count, loading, error) => ({
    list,
    count,
    loading,
    error,
  }),
)

export const selectAccountCounts = createSelector(
  [
    (state: RootState) => state.ledger.accountCounts,
    (state: RootState) => state.ledger.accountCountsLoading,
    (state: RootState) => state.ledger.accountCountsError,
  ],
  (data, loading, error) => ({
    data,
    loading,
    error,
  }),
)

export default ledgerSlice.reducer
