import { useEffect, useRef, useState } from 'react';
import { Button, Card, CardContent, Chip, Stack, TextField, Typography } from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProfile, updateProfile } from '../features/auth/authSlice';
import { fetchMyOrders } from '../features/orders/orderSlice';
import DeliveryCountdown from '../components/DeliveryCountdown';
import api from '../api/client';
import { formatCurrency } from '../utils/format';
import { io } from 'socket.io-client';

function DashboardPage() {
  const dispatch = useDispatch();
  const { user, lastPurchases } = useSelector((state) => state.auth);
  const { myOrders } = useSelector((state) => state.orders);
  const { items: cartItems } = useSelector((state) => state.cart);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [likedService, setLikedService] = useState(null);
  const [serviceComment, setServiceComment] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [contactHistory, setContactHistory] = useState([]);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const isSavingProfileRef = useRef(false);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchMyOrders());
  }, [dispatch]);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const { data } = await api.get('/notifications/service-feedback/mine');
        setFeedbackHistory(data);
      } catch {
        setFeedbackHistory([]);
      }
    };

    const loadContactHistory = async () => {
      try {
        const { data } = await api.get('/notifications/contact-admin/mine');
        setContactHistory(data);
      } catch {
        setContactHistory([]);
      }
    };

    loadFeedback();
    loadContactHistory();

    const refreshInterval = setInterval(loadContactHistory, 15000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socket.emit('join-user-room', user._id);

    socket.on('message:reply', (payload) => {
      setContactHistory((prev) =>
        prev.map((message) =>
          message._id === payload.messageId
            ? {
                ...message,
                adminReply: payload.adminReply,
                status: payload.status || 'Replied',
                repliedAt: payload.repliedAt || message.repliedAt
              }
            : message
        )
      );
      toast.success(`Admin replied: ${payload.subject}`);
    });

    return () => socket.disconnect();
  }, [user?._id]);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setAddress(user?.address || '');
  }, [user]);

  const saveProfile = async () => {
    if (isSavingProfileRef.current) return;

    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error('Please fill name, phone, and address before saving.');
      return;
    }

    isSavingProfileRef.current = true;
    setSavingProfile(true);
    try {
      const result = await dispatch(updateProfile({ name, phone, address }));
      if (result.error) {
        throw new Error(result.payload || 'Profile update failed');
      }

      setIsEditingProfile(false);
      toast.success('Profile updated successfully.');
    } catch (error) {
      toast.error(error.message || 'Unable to update profile right now.');
    } finally {
      isSavingProfileRef.current = false;
      setSavingProfile(false);
    }
  };

  const contactAdmin = async () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      toast.error('Subject and message are required.');
      return;
    }

    try {
      const { data } = await api.post('/notifications/contact-admin', { subject: contactSubject, message: contactMessage });
      if (data?.payload) {
        setContactHistory((prev) => [data.payload, ...prev].slice(0, 20));
      }
      setContactSubject('');
      setContactMessage('');
      toast.success('Your message has been sent to admin.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send message.');
    }
  };

  const submitServiceFeedback = async () => {
    if (likedService === null) {
      toast.error('Please choose if you liked our service.');
      return;
    }

    setSendingFeedback(true);
    try {
      const { data } = await api.post('/notifications/service-feedback', {
        likedService,
        comment: serviceComment
      });

      setFeedbackHistory((prev) => [data.feedback, ...prev].slice(0, 10));
      setServiceComment('');
      setLikedService(null);
      toast.success('Thanks for sharing your feedback.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit feedback.');
    } finally {
      setSendingFeedback(false);
    }
  };

  const previousOrders = myOrders;
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.discountedPrice || item.price) * item.quantity,
    0
  );

  const trackingSteps = (status) => {
    const isShipped = status === 'Shipped' || status === 'Delivered';
    const isDelivered = status === 'Delivered';

    return [
      { key: 'picked', label: 'Picked', done: true },
      { key: 'payment', label: 'Payment', done: true },
      { key: 'delivery', label: 'Delivery', done: isDelivered, inProgress: isShipped && !isDelivered }
    ];
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h3" sx={{ fontWeight: 800 }}>My Dashboard</Typography>
      <Card><CardContent><Typography variant="h6">Last Purchase</Typography><Typography>{lastPurchases[0]?._id || 'No purchase yet'}</Typography></CardContent></Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Profile Details</Typography>
          <Stack spacing={2}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditingProfile} />
            <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditingProfile} />
            <TextField label="Address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={!isEditingProfile} />
            {!isEditingProfile ? (
              <Button variant="outlined" onClick={() => setIsEditingProfile(true)}>
                Edit Profile
              </Button>
            ) : (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="contained" onClick={saveProfile} disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </Button>
                <Button variant="text" onClick={() => setIsEditingProfile(false)}>
                  Cancel
                </Button>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
            <Stack>
              <Typography variant="h6">Your Cart (Not Yet Purchased)</Typography>
              <Typography color="text.secondary">
                {cartItems.length ? `${cartItems.length} item(s) in cart` : 'Your cart is empty'}
              </Typography>
              <Typography sx={{ fontWeight: 700, mt: 0.5 }}>
                Total: {formatCurrency(cartTotal)}
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                component={Link}
                to="/cart"
                variant="outlined"
                startIcon={<ShoppingCartOutlinedIcon />}
                sx={{
                  borderColor: '#2e7d32',
                  color: '#1b5e20',
                  px: 2.5,
                  py: 1,
                  fontWeight: 700,
                  '&:hover': { borderColor: '#1b5e20', backgroundColor: 'rgba(46, 125, 50, 0.08)' }
                }}
              >
                View Cart
              </Button>
              <Button
                component={Link}
                to="/products"
                variant="contained"
                color="success"
                startIcon={<StorefrontOutlinedIcon />}
                sx={{
                  px: 2.8,
                  py: 1,
                  fontWeight: 700,
                  boxShadow: '0 8px 18px rgba(46, 125, 50, 0.24)',
                  '&:hover': { boxShadow: '0 10px 22px rgba(46, 125, 50, 0.32)' }
                }}
              >
                Shop Now
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Previous Orders</Typography>
          <Typography color="text.secondary" sx={{ mb: 1.5 }}>
            Paid orders are moved here after checkout.
          </Typography>
          <Stack spacing={1}>
            {previousOrders.length === 0 ? (
              <Typography color="text.secondary">No previous orders yet.</Typography>
            ) : (
              previousOrders.map((order) => (
                <Card key={order._id} variant="outlined" sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 700 }}>Order #{order._id.slice(-6)}</Typography>
                  <Typography sx={{ mt: 1, fontWeight: 600 }}>
                    Total: {formatCurrency(order.total || 0)}
                  </Typography>
                  <Stack spacing={0.6} sx={{ mt: 1.2 }}>
                    {order.items?.map((item) => (
                      <Typography key={`${order._id}-${item.product || item.name}`} variant="body2" color="text.secondary">
                        {item.name} x {item.quantity}
                      </Typography>
                    ))}
                  </Stack>
                </Card>
              ))
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Order Tracking Monitor</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {myOrders.map((order) => (
              <Card key={order._id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                  <Typography>Order #{order._id.slice(-6)}</Typography>
                  <Chip label={order.status} color={order.status === 'Delivered' ? 'success' : 'warning'} />
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                  {trackingSteps(order.status).map((step) => (
                    <Chip
                      key={`${order._id}-monitor-${step.key}`}
                      label={step.label}
                      color={step.done ? 'success' : step.inProgress ? 'warning' : 'default'}
                      variant={step.done || step.inProgress ? 'filled' : 'outlined'}
                    />
                  ))}
                </Stack>
                <DeliveryCountdown target={order.estimatedDeliveryAt} />
              </Card>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Contact Admin</Typography>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Subject" value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} />
            <TextField multiline minRows={3} label="Message" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} />
            <Button variant="outlined" onClick={contactAdmin}>Send message</Button>
          </Stack>

          <Stack spacing={1} sx={{ mt: 2 }}>
            {contactHistory.length === 0 ? (
              <Typography color="text.secondary">No messages yet.</Typography>
            ) : (
              contactHistory.map((message) => (
                <Card key={message._id} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                    <Typography sx={{ fontWeight: 700 }}>{message.subject}</Typography>
                    <Chip
                      size="small"
                      label={message.status}
                      color={message.status === 'Replied' ? 'success' : 'warning'}
                    />
                  </Stack>
                  <Typography sx={{ mt: 0.7 }}>{message.message}</Typography>
                  {message.adminReply ? (
                    <Typography sx={{ mt: 0.8, color: '#1b5e20', fontWeight: 600 }}>
                      Admin reply: {message.adminReply}
                    </Typography>
                  ) : (
                    <Typography sx={{ mt: 0.8 }} color="text.secondary">
                      Awaiting admin reply...
                    </Typography>
                  )}
                </Card>
              ))
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Rate Our Service</Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
            <Button
              variant={likedService === true ? 'contained' : 'outlined'}
              color="success"
              onClick={() => setLikedService(true)}
            >
              I like the service
            </Button>
            <Button
              variant={likedService === false ? 'contained' : 'outlined'}
              color="warning"
              onClick={() => setLikedService(false)}
            >
              Needs improvement
            </Button>
          </Stack>
          <TextField
            sx={{ mt: 2 }}
            multiline
            minRows={3}
            fullWidth
            label="Comment"
            placeholder="Share your experience with delivery, quality, or support"
            value={serviceComment}
            onChange={(e) => setServiceComment(e.target.value)}
          />
          <Button sx={{ mt: 1.5 }} variant="contained" onClick={submitServiceFeedback} disabled={sendingFeedback}>
            {sendingFeedback ? 'Submitting...' : 'Submit Feedback'}
          </Button>

          <Stack spacing={1} sx={{ mt: 2 }}>
            {feedbackHistory.map((feedback) => (
              <Card key={feedback._id} variant="outlined" sx={{ p: 1.5 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                  <Chip
                    size="small"
                    label={feedback.likedService ? 'Liked service' : 'Needs improvement'}
                    color={feedback.likedService ? 'success' : 'warning'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(feedback.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
                <Typography sx={{ mt: 1 }}>
                  {feedback.comment || 'No comment added.'}
                </Typography>
              </Card>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default DashboardPage;
