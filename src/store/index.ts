import { configureStore } from "@reduxjs/toolkit";

import { appSlice } from "@/store/app";
import { masterSlice } from "@/store/master";

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    masters: masterSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
