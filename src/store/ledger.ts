import {
  SerializedError,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { LedgerSearchRequest, LedgerSearchResponse } from "@/models/ledger";

export interface LedgerState {
  data: {
    ledger_list: LedgerSearchResponse[];
  };
  loading: boolean;
  error: SerializedError | null;
}

const initialState: LedgerState = {
  data: {
    ledger_list: [],
  },
  loading: true,
  error: null,
};

export const loadLedgerList = createAsyncThunk<
  LedgerSearchResponse[],
  LedgerSearchRequest
>("app/loadLedgerList", async (request) => {
  const response = await fetch(
    `/api/v1/ledger/${request.nendo}/${request.ledger_cd}`
  );
  const data = await response.json();
  return data;
});

export const ledgerSlice = createSlice({
  name: "ledger",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadLedgerList.fulfilled, (state, action) => {
      state.loading = false;
      state.data.ledger_list = action.payload;
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
