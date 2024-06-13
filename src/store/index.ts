import { journalSlice } from './journal'
import { settingsSlice } from './settings'

import { configureStore } from '@reduxjs/toolkit'

import { appSlice } from '@/store/app'
import { ledgerSlice } from '@/store/ledger'
import { masterSlice } from '@/store/master'

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    ledger: ledgerSlice.reducer,
    journal: journalSlice.reducer,
    masters: masterSlice.reducer,
    settings: settingsSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export type NextActions = any[]

// FIXME
//
// Calling this function in the createAsyncThunk method causes a build error.
// But if I paste the code inside directly into createAsyncThunk, no error occurs.
//
// export const callNextActions = (
//   dispatch: (action: any) => void,
//   nextActions: NextActions,
// ) => {
//   for (const action of nextActions) {
//     return dispatch(action)
//   }
// }
