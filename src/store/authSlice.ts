import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export type AuthState = {
  user: { id: string; email: string } | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

export const loginThunk = createAsyncThunk('auth/login', async () => {
  // TODO: implement login flow
  return { id: 'placeholder-id', email: 'placeholder@example.com' };
});

export const signupThunk = createAsyncThunk('auth/signup', async () => {
  // TODO: implement signup flow
  return { id: 'placeholder-id', email: 'placeholder@example.com' };
});

export const fetchMeThunk = createAsyncThunk('auth/fetchMe', async () => {
  // TODO: implement session fetch
  return { id: 'placeholder-id', email: 'placeholder@example.com' };
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state) => {
        state.isLoading = false;
        state.error = 'Login failed';
      })
      .addCase(signupThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signupThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(signupThunk.rejected, (state) => {
        state.isLoading = false;
        state.error = 'Signup failed';
      })
      .addCase(fetchMeThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchMeThunk.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
