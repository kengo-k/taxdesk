import {
  PayloadAction,
  SerializedError,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { LedgerSearchRequest, LedgerSearchResponse } from "@/models/ledger";

export interface LedgerState {
  data: {
    ledger_list: LedgerSearchResponse[];
    all_count: number;
  };
  loading: boolean;
  error: SerializedError | null;
}

const initialState: LedgerState = {
  data: {
    ledger_list: [],
    all_count: 0,
  },
  loading: true,
  error: null,
};

export const loadLedgerList = createAsyncThunk<
  { all_count: number; list: LedgerSearchResponse[] },
  LedgerSearchRequest
>("ledger/loadLedgerList", async (request) => {
  const response = await fetch(
    `/api/v1/ledger/${request.nendo}/${request.ledger_cd}`
  );
  const data = await response.json();
  return data;
});

export const ledgerSlice = createSlice({
  name: "ledger",
  initialState,
  reducers: {
    setLedgerList: (
      state,
      action: PayloadAction<{
        ledger_list: LedgerSearchResponse[];
        all_count: number;
      }>
    ) => {
      state.data.all_count = action.payload.all_count;
      state.data.ledger_list = action.payload.ledger_list;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadLedgerList.fulfilled, (state, action) => {
      state.loading = false;
      state.data.ledger_list = action.payload.list;
      state.data.all_count = action.payload.all_count;
    });
    builder.addCase(loadLedgerList.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadLedgerList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });
  },
});

export const ledgerActions = ledgerSlice.actions;
