import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';

const storedUser = JSON.parse(localStorage.getItem('agromart_user') || 'null');

export const registerUser = createAsyncThunk('auth/register', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    return data;
  } catch (error) {
    const message = error.response?.data?.message || (error.message === 'Network Error' ? 'Cannot reach server. Start backend and check CORS.' : 'Registration failed');
    return thunkAPI.rejectWithValue(message);
  }
});

export const loginUser = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/auth/login', payload);
    return data;
  } catch (error) {
    const message = error.response?.data?.message || (error.message === 'Network Error' ? 'Cannot reach server. Start backend and check CORS.' : 'Login failed');
    return thunkAPI.rejectWithValue(message);
  }
});

export const loginAdmin = createAsyncThunk('auth/adminLogin', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/auth/admin/login', payload);
    return data;
  } catch (error) {
    const message = error.response?.data?.message || (error.message === 'Network Error' ? 'Cannot reach server. Start backend and check CORS.' : 'Admin login failed');
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Profile load failed');
  }
});

export const updateProfile = createAsyncThunk('auth/update', async (payload, thunkAPI) => {
  try {
    const { data } = await api.put('/auth/me', payload);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Profile update failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: localStorage.getItem('agromart_token'),
    lastPurchases: [],
    loading: false,
    error: null
  },
  reducers: {
    applyOAuthToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('agromart_token', action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.lastPurchases = [];
      state.error = null;
      localStorage.removeItem('agromart_token');
      localStorage.removeItem('agromart_user');
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('agromart_token', action.payload.token);
        localStorage.setItem('agromart_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('agromart_token', action.payload.token);
        localStorage.setItem('agromart_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.lastPurchases = action.payload.lastPurchases;
        localStorage.setItem('agromart_user', JSON.stringify(action.payload.user));
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('agromart_user', JSON.stringify(action.payload));
      });
  }
});

export const { logout, applyOAuthToken, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
