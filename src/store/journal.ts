import { NextActions, callNextActions } from '.'

import { journals } from '@prisma/client'
import {
  SerializedError,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'

import { JournalDeleteRequest } from '@/models/journal'

import { fetchWithAuth } from '@/misc/fetch'

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
>('journal/update', async (request) => {
  const response = await fetchWithAuth(`/api/v1/journal/${request.id}`, {
    method: 'PUT',
  })
  const data = await response.json()
  return data
})

export const deleteJournal = createAsyncThunk<
  void,
  {
    request: JournalDeleteRequest
    next: NextActions
  }
>('journal/delete', async ({ request, next }, { dispatch }) => {
  const response = await fetchWithAuth(
    `/api/v1/journal/${request.nendo}/${request.journal_id}`,
    {
      method: 'DELETE',
    },
  )
  const data = await response.json()
  callNextActions(dispatch, next)
  return data
})

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
