import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';

export const fetchProducts = createAsyncThunk('products/list', async (params, thunkAPI) => {
  try {
    const { data } = await api.get('/products', { params });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Products load failed');
  }
});

export const fetchProductDetails = createAsyncThunk('products/details', async (id, thunkAPI) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Product load failed');
  }
});

export const submitReview = createAsyncThunk('products/review', async ({ id, payload }, thunkAPI) => {
  try {
    await api.post(`/products/${id}/reviews`, payload);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Review failed');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    page: 1,
    totalPages: 1,
    featured: [],
    hotDeals: [],
    selected: null,
    reviews: [],
    loading: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.featured = action.payload.items.filter((product) => product.featured);
        state.hotDeals = action.payload.items.filter((product) => product.hotDeal);
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.selected = action.payload.product;
        state.reviews = action.payload.reviews;
      });
  }
});

export default productSlice.reducer;
