import { configureStore } from "@reduxjs/toolkit";

import counterReducer from "@/store/counterSlice";
import masterReducer from "@/store/master";
import appReducer from "@/store/app";

export const store = configureStore({
  reducer: {
    app: appReducer,
    counter: counterReducer,
    masters: masterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
