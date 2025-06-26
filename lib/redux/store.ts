import { configureStore } from '@reduxjs/toolkit'

import ledgerReducer from '@/lib/redux/features/ledgerSlice'
import masterReducer from '@/lib/redux/features/masterSlice'
import payrollReducer from '@/lib/redux/features/payrollSlice'
import reportReducer from '@/lib/redux/features/reportSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      master: masterReducer,
      ledger: ledgerReducer,
      report: reportReducer,
      payroll: payrollReducer,
    },
  })
}

// 型定義のエクスポート
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
