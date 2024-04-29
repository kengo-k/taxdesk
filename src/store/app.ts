import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export interface AppState {
  selected_nendo: string | undefined
  is_journal: boolean
  is_ledger: boolean
  selected_ledger_cd: string | undefined
}

const initialState: AppState = {
  selected_nendo: undefined,
  is_journal: false,
  is_ledger: false,
  selected_ledger_cd: undefined,
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
  },
})

export const appActions = appSlice.actions
