import { kamoku_masters, nendo_masters, saimoku_masters } from "@prisma/client";
import {
  SerializedError,
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";

import { RootState } from "@/store";

export interface MasterState {
  data: {
    nendo_list: nendo_masters[];
    kamoku_list: kamoku_masters[];
    saimoku_list: saimoku_masters[];
  };
  loading: boolean;
  error: SerializedError | null;
}

const initialState: MasterState = {
  data: {
    nendo_list: [],
    kamoku_list: [],
    saimoku_list: [],
  },
  loading: true,
  error: null,
};

export const loadMasters = createAsyncThunk("masters/loadMasters", async () => {
  const response = await fetch("/api/v1/masters");
  const data = await response.json();
  return data;
});

export const masterSlice = createSlice({
  name: "masters",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadMasters.fulfilled, (state, action) => {
      state.loading = false;
      state.data.nendo_list = action.payload.nendo_list;
      state.data.kamoku_list = action.payload.kamoku_list;
      state.data.saimoku_list = action.payload.saimoku_list;
    });
    builder.addCase(loadMasters.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadMasters.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });
  },
});

const selectSaimokuList = (state: RootState) => state.masters.data.saimoku_list;
const selectNendoList = (state: RootState) => state.masters.data.nendo_list;

export const selectSaimokuMap = createSelector(
  [selectSaimokuList],
  (saimoku_list) => {
    const map: Map<string, saimoku_masters> = new Map();
    for (const saimoku of saimoku_list) {
      if (saimoku.id != null) {
        map.set(saimoku.saimoku_cd, saimoku);
      }
    }
    return map;
  }
);

export const selectNendoMap = createSelector(
  [selectNendoList],
  (nendo_list) => {
    const map: Map<string, nendo_masters> = new Map();
    for (const nendo of nendo_list) {
      map.set(nendo.nendo, nendo);
    }
    return map;
  }
);

export const masterActions = masterSlice.actions;
