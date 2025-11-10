import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { initDatabase } from '../database/database';

export const initializeDatabase = createAsyncThunk(
  'database/init',
  async () => {
    await initDatabase();
    return true;
  }
);

const databaseSlice = createSlice({
  name: 'database',
  initialState: { initialized: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(initializeDatabase.fulfilled, (state) => {
      state.initialized = true;
    });
  },
});

export default databaseSlice.reducer;
