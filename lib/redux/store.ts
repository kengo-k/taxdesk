import { configureStore } from "@reduxjs/toolkit"
import accountReducer from "./features/accountSlice"
import taxReducer from "./features/taxSlice"
import fiscalYearReducer from "./features/fiscalYearSlice"
import transactionReducer from "./features/transactionSlice"

export const makeStore = () => {
  return configureStore({
    reducer: {
      account: accountReducer,
      tax: taxReducer,
      fiscalYear: fiscalYearReducer,
      transaction: transactionReducer,
    },
  })
}

// 型定義のエクスポート
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
