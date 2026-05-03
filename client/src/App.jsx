import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import OAuthSuccessPage from './pages/OAuthSuccessPage';
import { AdminLoginPage, LoginPage, RegisterPage } from './pages/AuthPage';

import { fetchProfile } from './features/auth/authSlice';
import { pushNotification } from './features/notifications/notificationSlice';
import { receiveOrderRealtime } from './features/orders/orderSlice';

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

function App() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  
  useEffect(() => {
    if (!API_URL) {
      console.error('VITE_API_URL is not defined');
      return;
    }

    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => console.log('Products:', data))
      .catch((err) => console.error('API Error:', err));
  }, []);

 
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, token, user]);

  useEffect(() => {
    if (!token || !user?._id || !SOCKET_URL) return;

    const socket = io(SOCKET_URL);

    socket.emit('join-user-room', user._id);

    socket.on('order:update', (payload) => {
      dispatch(receiveOrderRealtime(payload));
      dispatch(pushNotification(payload));
      toast.success(payload.message);
      playAlert();
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, token, user?._id]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />

          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="admin" element={<AdminEntryRoute />} />

          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute adminOnly redirectTo="/admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="oauth-success" element={<OAuthSuccessPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


function AdminEntryRoute() {
  const { token, user } = useSelector((state) => state.auth);

  if (token && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (token && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminLoginPage />;
}


function playAlert() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 840;
    gainNode.gain.value = 0.02;

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (err) {
    console.warn('Audio blocked:', err);
  }
}

export default App;