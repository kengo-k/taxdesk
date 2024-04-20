import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

export const fetchMessage = createAsyncThunk(
  'counter/fetchMessage',
  async () => {
    const response = await fetch('/api/hello')
    const data = await response.json()
    return data.message
  }
)

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
    message: '',
  },
  reducers: {
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessage.fulfilled, (state, action) => {
      state.message = action.payload
    })
  },
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions
export default counterSlice.reducer
