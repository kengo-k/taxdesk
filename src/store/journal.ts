import { NextActions } from '.'

import { journals } from '@prisma/client'
import {
  SerializedError,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'

import { JournalDeleteRequest } from '@/models/journal'

import { error_handler, fetchWithAuth } from '@/misc/fetch'

export interface JournalState {
  data: {
    journal_list: journals[]
    all_count: number
  }
  loading: boolean
  error: SerializedError | null
}

const initialState: JournalState = {
  data: {
    journal_list: [],
    all_count: 0,
  },
  loading: true,
  error: null,
}

export const updateJournal = createAsyncThunk<
  void,
  {
    id: number
    journal: Partial<Omit<journals, 'id'>>
  }
>('journal/update', async (request, { dispatch, rejectWithValue }) => {
  return await fetchWithAuth(
    `/api/v1/journal/${request.id}`,
    error_handler(dispatch, rejectWithValue),
    {
      method: 'PUT',
    },
  )
})

export const deleteJournal = createAsyncThunk<
  void,
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
      return dispatch(action)
    }
    return json
  },
)

export const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(deleteJournal.fulfilled, (state, action) => {
      state.loading = false
    })
    builder.addCase(deleteJournal.pending, (state) => {
      state.loading = true
    })
    builder.addCase(deleteJournal.rejected, (state, action) => {
      state.loading = false
      state.error = action.error
    })
  },
})

export const journalActions = journalSlice.actions
