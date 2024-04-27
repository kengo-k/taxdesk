import { configureStore } from "@reduxjs/toolkit";

import { appSlice } from "@/store/app";
import { ledgerSlice } from "@/store/ledger";
import { masterSlice } from "@/store/master";

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    ledger: ledgerSlice.reducer,
    masters: masterSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type NextActions = any[] | (() => any[]);
export const callNextActions = (nextActions: NextActions | undefined) => {
  if (nextActions == null) {
    return [];
  }
  if (typeof nextActions === "function") {
    return nextActions();
  } else {
    return nextActions;
  }
};
