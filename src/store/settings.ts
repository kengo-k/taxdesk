import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { BackupItem } from '@/models/backup'

import { ApiResState, ApiResponse, initApiResState } from '@/misc/api'
import { error_handler, fetchWithAuth } from '@/misc/fetch'

export interface SettingsState {
  backup_list: ApiResState<BackupItem[]>
  create_backup: ApiResState<null>
  restore_from_backup: ApiResState<null>
}

const initialState: SettingsState = {
  backup_list: initApiResState([]),
  create_backup: initApiResState(null),
  restore_from_backup: initApiResState(null),
}

export const loadBackupList = createAsyncThunk<ApiResponse<BackupItem[]>, void>(
  'ledger/loadBackupList',
  async (_, { dispatch, rejectWithValue }) => {
    return await fetchWithAuth(
      '/api/v1/settings/database/backups',
      error_handler(dispatch, rejectWithValue),
    )
  },
)

export const createBackup = createAsyncThunk<ApiResponse<never>, void>(
  'ledger/createBackup',
  async (_, { dispatch, rejectWithValue }) => {
    return await fetchWithAuth(
      '/api/v1/settings/database/backups',
      error_handler(dispatch, rejectWithValue),
      {
        method: 'POST',
        body: JSON.stringify({}),
      },
    )
  },
)

export const restoreFromBackup = createAsyncThunk<ApiResponse<never>, string>(
  'ledger/restoreFromBackup',
  async (backup_id, { dispatch, rejectWithValue }) => {
    return await fetchWithAuth(
      `/api/v1/settings/database?backup_id=${backup_id}`,
      error_handler(dispatch, rejectWithValue),
      {
        method: 'PUT',
        body: JSON.stringify({}),
      },
    )
  },
)

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // loadBackupList
    builder.addCase(loadBackupList.fulfilled, (state, action) => {
      state.backup_list = { ...action.payload, loading: false }
    })
    builder.addCase(loadBackupList.pending, (state) => {
      state.backup_list.loading = true
      state.backup_list.error = false
    })
    builder.addCase(loadBackupList.rejected, (state, action) => {
      const payload = action.payload as any // TODO FIXME
      state.backup_list = { ...payload, loading: false }
    })

    // createBackup
    builder.addCase(createBackup.fulfilled, (state, action) => {
      state.create_backup = { ...action.payload, loading: false }
    })
    builder.addCase(createBackup.pending, (state) => {
      state.create_backup.loading = true
      state.create_backup.error = false
    })
    builder.addCase(createBackup.rejected, (state, action) => {
      const payload = action.payload as any // TODO FIXME
      state.create_backup = { ...payload, loading: false }
    })

    // restoreFromBackup
    builder.addCase(restoreFromBackup.fulfilled, (state, action) => {
      state.restore_from_backup = { ...action.payload, loading: false }
    })
    builder.addCase(restoreFromBackup.pending, (state) => {
      state.restore_from_backup.loading = true
      state.restore_from_backup.error = false
    })
    builder.addCase(restoreFromBackup.rejected, (state, action) => {
      const payload = action.payload as any // TODO FIXME
      state.restore_from_backup = { ...payload, loading: false }
    })
  },
})

export const settingsActions = settingsSlice.actions
