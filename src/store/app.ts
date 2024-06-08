import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface AppState {
  selected_nendo: string | undefined
  is_journal: boolean
  is_ledger: boolean
  selected_ledger_cd: string | undefined
  selected_month: string | undefined
  page_no: number
  page_size: number
  unauthorized: boolean
}

const initialState: AppState = {
  selected_nendo: undefined,
  is_journal: false,
  is_ledger: false,
  selected_ledger_cd: undefined,
  selected_month: undefined,
  page_no: 1,
  page_size: 10,
  unauthorized: false,
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setNendo: (state, action: PayloadAction<string | undefined>) => {
      state.selected_nendo = action.payload
    },
    showJournal: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state.is_journal = true
        state.is_ledger = false
      } else {
        state.is_journal = false
      }
    },
    showLedger: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state.is_ledger = true
        state.is_journal = false
      } else {
        state.is_ledger = false
      }
    },
    setLedgerCd: (state, action: PayloadAction<string | undefined>) => {
      state.selected_ledger_cd = action.payload
    },
    setMonth: (state, action: PayloadAction<string | undefined>) => {
      state.selected_month = action.payload
    },
    setPageNo: (state, action: PayloadAction<number>) => {
      state.page_no = action.payload
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.page_size = action.payload
    },
    setUnauthorized: (state, action: PayloadAction<boolean>) => {
      state.unauthorized = action.payload
    },
  },
})

export const appActions = appSlice.actions
