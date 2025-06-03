import { configureStore } from '@reduxjs/toolkit'

import masterReducer from '@/lib/redux/features/masterSlice'
import reportReducer from '@/lib/redux/features/reportSlice'
import transactionReducer from '@/lib/redux/features/transactionSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      master: masterReducer,
      transaction: transactionReducer,
      report: reportReducer,
    },
  })
}

// 型定義のエクスポート
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
