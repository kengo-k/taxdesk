import { NextActions } from '.'

import { journals } from '@prisma/client'
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { JournalDeleteRequest } from '@/models/journal'

import { ApiResState, ApiResponse, initApiResState } from '@/misc/api'
import { error_handler, fetchWithAuth } from '@/misc/fetch'

export interface JournalState {
  last_deleted: ApiResState<journals | null>
  delete_journal_id: number | null
}

const initialState: JournalState = {
  last_deleted: initApiResState(null),
  delete_journal_id: null,
}

export const deleteJournal = createAsyncThunk<
  ApiResponse<journals | null>,
  {
    request: JournalDeleteRequest
    next: NextActions
  }
>(
  'journal/delete',
  async ({ request, next }, { dispatch, rejectWithValue }) => {
    const json = await fetchWithAuth(
      `/api/v1/journal/${request.nendo}/${request.journal_id}`,
      error_handler(dispatch, rejectWithValue),
      {
        method: 'DELETE',
      },
    )
    for (const action of next) {
      dispatch(action)
    }
    return json
  },
)

export const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    setDeleteJournalId: (state, action: PayloadAction<number | null>) => {
      state.delete_journal_id = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteJournal.fulfilled, (state, action) => {
      state.last_deleted = {
        ...action.payload,
        loading: false,
      }
    })
    builder.addCase(deleteJournal.pending, (state) => {
      state.last_deleted.loading = true
    })
  },
})

export const journalActions = journalSlice.actions
