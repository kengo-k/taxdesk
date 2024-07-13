import { journals } from '@prisma/client'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { NextActions } from '@/store'

import {
  LedgerCreateRequest,
  LedgerSearchRequest,
  LedgerSearchResponse,
  LedgerUpdateRequest,
} from '@/models/ledger'

import { ApiResState, ApiResponse, initApiResState } from '@/misc/api'
import { error_handler, fetchWithAuth } from '@/misc/fetch'
import { createQueryString } from '@/misc/object'

export interface LedgerState {
  last_upserted: ApiResState<journals | null>
  ledger_list: ApiResState<{ all_count: number; list: LedgerSearchResponse[] }>
}

const initialState: LedgerState = {
  last_upserted: initApiResState(null),
  ledger_list: initApiResState({ all_count: 0, list: [] }),
}

export const loadLedgerList = createAsyncThunk<
  ApiResponse<{ all_count: number; list: LedgerSearchResponse[] }>,
  LedgerSearchRequest
>('ledger/loadLedgerList', async (request, { dispatch, rejectWithValue }) => {
  const qs = createQueryString(request, ['month', 'page_no', 'page_size'])
  return await fetchWithAuth(
    `/api/v1/ledger/${request.nendo}/${request.ledger_cd}${qs.length === 0 ? '' : `?${qs}`}`,
    error_handler(dispatch, rejectWithValue),
  )
})

export const createLedger = createAsyncThunk<
  ApiResponse<journals>,
  { request: LedgerCreateRequest; next: NextActions }
>('ledger/create', async ({ request, next }, { dispatch, rejectWithValue }) => {
  const { nendo, ledger_cd, ...requestBody } = request
  const json = await fetchWithAuth(
    `/api/v1/ledger/${nendo}/${ledger_cd}`,
    error_handler(dispatch, rejectWithValue),
    {
      method: 'POST',
      body: JSON.stringify(requestBody),
    },
  )
  for (const action of next) {
    return dispatch(action)
  }
  return json
})

export const updateLedger = createAsyncThunk<
  journals,
  { request: LedgerUpdateRequest; next: NextActions }
>('ledger/update', async ({ request, next }, { dispatch, rejectWithValue }) => {
  const { nendo, ledger_cd, ...requestBody } = request
  const json = await fetchWithAuth(
    `/api/v1/ledger/${nendo}/${ledger_cd}`,
    error_handler(dispatch, rejectWithValue),
    {
      method: 'PUT',
      body: JSON.stringify(requestBody),
    },
  )
  for (const action of next) {
    return dispatch(action)
  }
  return json
})

export const ledgerSlice = createSlice({
  name: 'ledger',
  initialState,
  reducers: {
    clearLastUpserted: (state) => {
      if (!state.last_upserted.error) {
        state.last_upserted.data = null
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadLedgerList.fulfilled, (state, action) => {
      if (!action.payload.error) {
        state.ledger_list = {
          error: false,
          loading: false,
          data: action.payload.data,
        }
      }
    })

    builder.addCase(loadLedgerList.pending, (state) => {
      state.ledger_list = {
        error: false,
        loading: true,
        data: { all_count: 0, list: [] },
      }
    })

    builder.addCase(loadLedgerList.rejected, (state, action) => {
      state.ledger_list = {
        error: true,
        loading: false,
        message: '',
        errorCode: null,
        externalErrorCode: null,
        errorDetail: null,
      }
    })

    builder.addCase(createLedger.fulfilled, (state, action) => {
      if (!action.payload.error) {
        state.last_upserted = {
          error: false,
          loading: false,
          data: action.payload.data,
        }
      }
    })

    builder.addCase(createLedger.pending, (state) => {
      state.last_upserted = {
        error: false,
        loading: true,
        data: null,
      }
    })

    builder.addCase(createLedger.rejected, (state, action) => {
      state.last_upserted = {
        error: true,
        loading: false,
        message: '',
        errorCode: null,
        externalErrorCode: null,
        errorDetail: null,
      }
    })
  },
})

export const ledgerActions = ledgerSlice.actions
