import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';

export const createOrder = createAsyncThunk('orders/create', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/orders', payload);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Order failed');
  }
});

export const fetchMyOrders = createAsyncThunk('orders/my', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/orders/my');
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Could not load orders');
  }
});

export const fetchAdminStats = createAsyncThunk('orders/adminStats', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/admin/stats');
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Could not load admin stats');
  }
});

export const fetchAdminOrders = createAsyncThunk('orders/adminOrders', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/admin/orders');
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Could not load orders');
  }
});

export const fetchAdminActivities = createAsyncThunk('orders/adminActivities', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/admin/activities');
    return data.activities;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Could not load activities');
  }
});

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }, thunkAPI) => {
    try {
      const { data } = await api.patch(`/orders/${id}/status`, { status });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Status update failed');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    myOrders: [],
    adminOrders: [],
    adminStats: null,
    adminActivities: [],
    latestOrder: null,
    loading: false
  },
  reducers: {
    receiveOrderRealtime: (state, action) => {
      const incoming = action.payload;
      state.myOrders = state.myOrders.map((order) =>
        order._id === incoming.orderId ? { ...order, status: incoming.status } : order
      );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.fulfilled, (state, action) => {
        state.latestOrder = action.payload;
        state.myOrders.unshift(action.payload);
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrders = action.payload;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.adminOrders = action.payload;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.adminStats = action.payload;
      })
      .addCase(fetchAdminActivities.fulfilled, (state, action) => {
        state.adminActivities = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.adminOrders = state.adminOrders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      });
  }
});

export const { receiveOrderRealtime } = orderSlice.actions;
export default orderSlice.reducer;
