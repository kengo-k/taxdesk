import { configureStore } from '@reduxjs/toolkit'

import accountReducer from './features/accountSlice'
import fiscalYearReducer from './features/fiscalYearSlice'
import reportReducer from './features/reportSlice'
import taxReducer from './features/taxSlice'
import transactionReducer from './features/transactionSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      account: accountReducer,
      tax: taxReducer,
      fiscalYear: fiscalYearReducer,
      transaction: transactionReducer,
      report: reportReducer,
    },
  })
}

// 型定義のエクスポート
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
