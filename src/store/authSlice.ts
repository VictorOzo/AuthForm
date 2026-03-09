import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

type AuthUser = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
};

export type AuthState = {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

export const loginThunk = createAsyncThunk<AuthUser>('auth/login', async () => {
  const response = await fetch('/api/auth/login', { method: 'POST' });
  if (!response.ok) throw new Error('Login failed');
  return {
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@example.com',
    username: 'demo-user',
  };
});

export const signupThunk = createAsyncThunk<AuthUser>('auth/signup', async () => {
  const response = await fetch('/api/auth/signup', { method: 'POST' });
  if (!response.ok) throw new Error('Signup failed');
  return {
    firstName: 'New',
    lastName: 'User',
    email: 'new@example.com',
    username: 'new-user',
  };
});

export const meThunk = createAsyncThunk<AuthUser>('auth/me', async () => {
  const response = await fetch('/api/auth/me');
  if (!response.ok) throw new Error('Session lookup failed');
  const data = await response.json();
  return data.user ?? {
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@example.com',
    username: 'demo-user',
  };
});

export const updateProfileThunk = createAsyncThunk<AuthUser, Partial<AuthUser>>(
  'auth/updateProfile',
  async (payload) => {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Profile update failed');

    return payload;
  },
);

export const logoutThunk = createAsyncThunk<void>('auth/logout', async () => {
  const response = await fetch('/api/auth/logout', { method: 'POST' });
  if (!response.ok) throw new Error('Logout failed');
});

export const fetchMeThunk = meThunk;

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
        state.status = 'loading';
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Login failed';
      })
      .addCase(signupThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signupThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(signupThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Signup failed';
      })
      .addCase(meThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(meThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(meThunk.rejected, (state) => {
        state.status = 'idle';
      })
      .addCase(updateProfileThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = {
          ...state.user,
          ...action.payload,
        };
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Profile update failed';
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.status = 'idle';
        state.user = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
