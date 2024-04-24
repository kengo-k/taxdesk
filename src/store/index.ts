import { configureStore } from "@reduxjs/toolkit";

import appReducer from "@/store/app";
import masterReducer from "@/store/master";

export const store = configureStore({
  reducer: {
    app: appReducer,
    masters: masterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
