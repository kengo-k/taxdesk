import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'

import { JournalListItem } from '@/lib/backend/services/journal/list-journals'
import type { RootState } from '@/lib/redux/store'

export interface JournalSearchParams {
  fiscal_year: string
  account: string | null
  month: string | null
  accountSide: string | null
  note: string | null
  amount: string | null
  amountCondition: string | null
  checked: string | null
  page: number
  pageSize: number
}

interface JournalState {
  journalList: JournalListItem[]
  journalListCount: number
  journalListLoading: boolean
  journalListError: string | null
}

const initialState: JournalState = {
  journalList: [],
  journalListCount: 0,
  journalListLoading: false,
  journalListError: null,
}

export const fetchJournals = createAsyncThunk<
  { data: { all_count: number; journals: JournalListItem[] } },
  JournalSearchParams
>(
  'journal/fetchJournals',
  async (params: JournalSearchParams, { rejectWithValue }) => {
    try {
      // URLパラメータを構築
      const urlParams = new URLSearchParams()

      if (params.account) {
        urlParams.set('account', params.account)
      }
      if (params.month) {
        urlParams.set('month', params.month)
      }
      if (params.accountSide) {
        urlParams.set('accountSide', params.accountSide)
      }
      if (params.note) {
        urlParams.set('note', params.note)
      }
      if (params.amount) {
        urlParams.set('amount', params.amount)
      }
      if (params.amountCondition) {
        urlParams.set('amountCondition', params.amountCondition)
      }
      if (params.checked) {
        urlParams.set('checked', params.checked)
      }
      urlParams.set('pageno', params.page.toString())
      urlParams.set('pagesize', params.pageSize.toString())

      // APIリクエスト
      const url = `/api/fiscal-years/${params.fiscal_year}/journal${urlParams.size > 0 ? `?${urlParams.toString()}` : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : '仕訳データの取得中にエラーが発生しました',
      )
    }
  },
)

export const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    clearJournals: (state) => {
      state.journalList = []
      state.journalListCount = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJournals.pending, (state) => {
        state.journalListLoading = true
        state.journalListError = null
      })
      .addCase(fetchJournals.fulfilled, (state, action) => {
        state.journalListLoading = false
        state.journalList = action.payload.data.journals
        state.journalListCount = action.payload.data.all_count
      })
      .addCase(fetchJournals.rejected, (state, action) => {
        state.journalListLoading = false
        state.journalListError = action.payload as string
      })
  },
})

export const { clearJournals } = journalSlice.actions

export const selectJournalList = createSelector(
  [
    (state: RootState) => state.journal.journalList,
    (state: RootState) => state.journal.journalListCount,
    (state: RootState) => state.journal.journalListLoading,
    (state: RootState) => state.journal.journalListError,
  ],
  (list, count, loading, error) => ({
    list,
    count,
    loading,
    error,
  }),
)

export default journalSlice.reducer
