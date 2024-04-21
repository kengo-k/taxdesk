import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export const loadMasters = createAsyncThunk("masters/loadMasters", async () => {
  const response = await fetch("/api/v1/masters");
  const data = await response.json();
  return data.message;
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
      //state.message = action.payload;
    });
  },
});

//export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default masterSlice.reducer;
