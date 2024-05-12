import { journals } from '@prisma/client'
import {
  PayloadAction,
  SerializedError,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'

import { NextActions, callNextActions } from '@/store'

import {
  LedgerCreateRequest,
  LedgerSearchRequest,
  LedgerSearchResponse,
} from '@/models/ledger'

import { createQueryString } from '@/misc/object'

export interface LedgerState {
  data: {
    last_upserted: journals | null
    ledger_list: LedgerSearchResponse[]
    all_count: number
  }
  loading: boolean
  error: SerializedError | null
}

const initialState: LedgerState = {
  data: {
    last_upserted: null,
    ledger_list: [],
    all_count: 0,
  },
  loading: true,
  error: null,
}

export const loadLedgerList = createAsyncThunk<
  { all_count: number; list: LedgerSearchResponse[] },
  LedgerSearchRequest
>('ledger/loadLedgerList', async (request) => {
  const qs = createQueryString(request, ['month', 'page_no', 'page_size'])
  const response = await fetch(
    `/api/v1/ledger/${request.nendo}/${request.ledger_cd}${qs.length === 0 ? '' : `?${qs}`}`,
  )
  const data = await response.json()
  return data
})

export const createLedger = createAsyncThunk<
  journals,
  { request: LedgerCreateRequest; next: NextActions }
>('ledger/createLedger', async ({ request, next }, { dispatch }) => {
  const { nendo, ledger_cd, ...requestBody } = request
  const response = await fetch(`/api/v1/ledger/${nendo}/${ledger_cd}`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  })
  const data = await response.json()
  callNextActions(dispatch, next)
  return data
})

export const ledgerSlice = createSlice({
  name: 'ledger',
  initialState,
  reducers: {
    setLedgerList: (
      state,
      action: PayloadAction<{
        ledger_list: LedgerSearchResponse[]
        all_count: number
      }>,
    ) => {
      state.data.all_count = action.payload.all_count
      state.data.ledger_list = action.payload.ledger_list
    },
    clearLastUpserted: (state) => {
      state.data.last_upserted = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadLedgerList.fulfilled, (state, action) => {
      state.loading = false
      state.data.ledger_list = action.payload.list
      state.data.all_count = action.payload.all_count
    })
    builder.addCase(loadLedgerList.pending, (state) => {
      state.loading = true
    })
    builder.addCase(loadLedgerList.rejected, (state, action) => {
      state.loading = false
      state.error = action.error
    })

    builder.addCase(createLedger.fulfilled, (state, action) => {
      state.loading = false
      state.data.last_upserted = action.payload
    })
    builder.addCase(createLedger.pending, (state) => {
      state.loading = true
    })
    builder.addCase(createLedger.rejected, (state, action) => {
      state.loading = false
      state.error = action.error
    })
  },
})

export const ledgerActions = ledgerSlice.actions
