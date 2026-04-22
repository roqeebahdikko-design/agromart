import { createSlice } from '@reduxjs/toolkit';

const initialItems = JSON.parse(localStorage.getItem('agromart_cart') || '[]');

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: initialItems
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.items.find((cartItem) => cartItem._id === item._id);

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }

      localStorage.setItem('agromart_cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      localStorage.setItem('agromart_cart', JSON.stringify(state.items));
    },
    changeQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((cartItem) => cartItem._id === id);
      if (item) item.quantity = quantity;
      localStorage.setItem('agromart_cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.setItem('agromart_cart', JSON.stringify([]));
    }
  }
});

export const { addToCart, removeFromCart, changeQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
