import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  SerializedError,
} from "@reduxjs/toolkit";

export const loadMasters = createAsyncThunk("masters/loadMasters", async () => {
  const response = await fetch("/api/v1/masters");
  const data = await response.json();
  return data;
});

export const masterSlice = createSlice({
  name: "masters",
  initialState: {
    data: {
      nendo_list: [] as any,
      kamoku_list: [] as any,
      saimoku_list: [] as any,
    },
    loading: true,
    error: null as SerializedError | null,
  },
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

export default masterSlice.reducer;
