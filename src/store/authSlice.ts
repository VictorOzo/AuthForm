import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export type AuthUser = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
};

type AuthState = {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

export const meThunk = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  'auth/me',
  async (_, { rejectWithValue }) => {
    const response = await fetch('/api/auth/me', { credentials: 'include' });
    if (!response.ok) {
      return rejectWithValue('Session lookup failed');
    }
    const data = (await response.json()) as { user?: AuthUser };
    if (!data.user) return rejectWithValue('Session lookup failed');
    return data.user;
  },
);

export const logoutThunk = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    if (!response.ok) {
      return rejectWithValue('Logout failed');
    }
  },
);

export const updateProfileThunk = createAsyncThunk<AuthUser, Partial<AuthUser>, { rejectValue: string }>(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return rejectWithValue('Profile update failed');
    }

    const data = (await response.json()) as { user?: AuthUser };
    return data.user ?? payload;
  },
);

export const uploadAvatarThunk = createAsyncThunk<
  { avatarUrl?: string; user?: AuthUser },
  File,
  { rejectValue: string }
>('auth/uploadAvatar', async (file, { rejectWithValue }) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch('/api/user/avatar', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const data = (await response.json().catch(() => ({}))) as {
    avatarUrl?: string;
    user?: AuthUser;
    message?: string;
  };

  if (!response.ok) {
    return rejectWithValue(data.message ?? 'Avatar upload failed');
  }

  return { avatarUrl: data.avatarUrl, user: data.user };
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
      .addCase(meThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(meThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(meThunk.rejected, (state, action) => {
        state.status = 'idle';
        state.user = null;
        state.error = action.payload ?? null;
      })
      .addCase(updateProfileThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
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
        state.error = action.payload ?? 'Profile update failed';
      })
      .addCase(uploadAvatarThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(uploadAvatarThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload.user) {
          state.user = action.payload.user;
        } else if (action.payload.avatarUrl) {
          state.user = {
            ...state.user,
            avatarUrl: action.payload.avatarUrl,
          };
        }
      })
      .addCase(uploadAvatarThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Avatar upload failed';
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.status = 'idle';
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
