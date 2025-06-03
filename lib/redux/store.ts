import { configureStore } from '@reduxjs/toolkit'

import accountReducer from '@/lib/redux/features/accountSlice'
import fiscalYearReducer from '@/lib/redux/features/fiscalYearSlice'
import reportReducer from '@/lib/redux/features/reportSlice'
import transactionReducer from '@/lib/redux/features/transactionSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      account: accountReducer,
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
