import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import productsReducer from '../features/products/productSlice';
import cartReducer from '../features/cart/cartSlice';
import ordersReducer from '../features/orders/orderSlice';
import notificationsReducer from '../features/notifications/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    notifications: notificationsReducer
  }
});
