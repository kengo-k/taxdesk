import { configureStore } from '@reduxjs/toolkit'

import ledgerReducer from '@/lib/redux/features/ledgerSlice'
import masterReducer from '@/lib/redux/features/masterSlice'
import reportReducer from '@/lib/redux/features/reportSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      master: masterReducer,
      ledger: ledgerReducer,
      report: reportReducer,
    },
  })
}

// 型定義のエクスポート
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
