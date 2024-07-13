import { kamoku_masters, nendo_masters } from '@prisma/client'
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'

import { RootState } from '@/store'

import { SaimokuWithSummary } from '@/models/master'

import { ApiResState, ApiResponse, initApiResState } from '@/misc/api'
import { error_handler, fetchWithAuth } from '@/misc/fetch'

export interface MasterState {
  nendo_list: ApiResState<nendo_masters[]>
  kamoku_list: ApiResState<kamoku_masters[]>
  saimoku_list: ApiResState<SaimokuWithSummary[]>
}

const initialState: MasterState = {
  nendo_list: initApiResState([]),
  kamoku_list: initApiResState([]),
  saimoku_list: initApiResState([]),
}

export const loadNendo = createAsyncThunk<ApiResponse<nendo_masters[]>, void>(
  'masters/loadNendo',
  async (_, { dispatch, rejectWithValue }) => {
    return await fetchWithAuth(
      `/api/v1/masters/nendo`,
      error_handler(dispatch, rejectWithValue),
    )
  },
)

export const loadSaimoku = createAsyncThunk<
  ApiResponse<SaimokuWithSummary[]>,
  string
>(
  'masters/loadSaimokku',
  async (nendo: string, { dispatch, rejectWithValue }) => {
    return await fetchWithAuth(
      `/api/v1/masters/saimoku/${nendo}`,
      error_handler(dispatch, rejectWithValue),
    )
  },
)

export const masterSlice = createSlice({
  name: 'masters',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // loadNendo
    builder.addCase(loadNendo.fulfilled, (state, action) => {
      state.nendo_list = {
        loading: false,
        ...action.payload,
      }
    })
    builder.addCase(loadNendo.pending, (state) => {
      state.nendo_list.loading = true
    })

    // loadSaimoku
    builder.addCase(loadSaimoku.fulfilled, (state, action) => {
      state.saimoku_list = {
        loading: false,
        ...action.payload,
      }
    })
    builder.addCase(loadSaimoku.pending, (state) => {
      state.saimoku_list.loading = true
    })
  },
})

const selectSaimokuList = (state: RootState) => state.masters.saimoku_list
const selectNendoList = (state: RootState) => state.masters.nendo_list

export const selectSaimokuMap = createSelector(
  [selectSaimokuList],
  (saimoku_list) => {
    const map: Map<string, SaimokuWithSummary> = new Map()
    if (saimoku_list.error) {
      return map
    }
    for (const saimoku of saimoku_list.data) {
      if (saimoku.id != null) {
        map.set(saimoku.saimoku_cd, saimoku)
      }
    }
    return map
  },
)

export const selectNendoMap = createSelector(
  [selectNendoList],
  (nendo_list) => {
    const map: Map<string, nendo_masters> = new Map()
    if (nendo_list.error) {
      return map
    }
    for (const nendo of nendo_list.data) {
      map.set(nendo.nendo, nendo)
    }
    return map
  },
)

export const masterActions = masterSlice.actions
