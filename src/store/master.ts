import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export const loadMasters = createAsyncThunk("masters/loadMasters", async () => {
  const response = await fetch("/api/v1/masters");
  const data = await response.json();
  return data;
});

export const masterSlice = createSlice({
  name: "masters",
  initialState: {
    nendo_list: [] as any,
    kamoku_list: [] as any,
    saimoku_list: [] as any,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadMasters.fulfilled, (state, action) => {
      state.nendo_list = action.payload.nendo_list;
      state.kamoku_list = action.payload.kamoku_list;
      state.saimoku_list = action.payload.saimoku_list;
    });
  },
});

export default masterSlice.reducer;
