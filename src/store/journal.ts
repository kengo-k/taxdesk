import { journals } from "@prisma/client";
import {
  SerializedError,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { NextActions } from "@/store";

export interface JournalState {
  data: {
    journal_list: journals[];
    all_count: number;
  };
  loading: boolean;
  error: SerializedError | null;
}

const initialState: JournalState = {
  data: {
    journal_list: [],
    all_count: 0,
  },
  loading: true,
  error: null,
};

export const updateJournal = createAsyncThunk<
  void,
  {
    id: number;
    journal: Partial<Omit<journals, "id">>;
    nextActions: NextActions;
  }
>("journal/updateJournal", async (request) => {
  const response = await fetch(`/api/v1/journal/${request.id}`, {
    method: "PUT",
  });
  const data = await response.json();
  return data;
});

export const journalSlice = createSlice({
  name: "journal",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(updateJournal.fulfilled, (state, action) => {
      state.loading = false;
      // const foo = updateJournal({ id: 1, journal: {}, nextActions: [] });
      // for (const a in action.meta.arg.nextActions) {
      //   store.dispatch(foo);
      // }
    });
    builder.addCase(updateJournal.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateJournal.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });
    builder.addCase(updateJournal.fulfilled, (state, action) => {
      state.loading = false;
      // const foo = updateJournal({ id: 1, journal: {}, nextActions: [] });
      // for (const a in action.meta.arg.nextActions) {
      //   store.dispatch(foo);
      // }
    });
    builder.addCase(updateJournal.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateJournal.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
    });
  },
});

export const journalActions = journalSlice.actions;
