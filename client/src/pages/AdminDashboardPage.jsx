import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Chip,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchAdminActivities, fetchAdminOrders, fetchAdminStats, updateOrderStatus } from '../features/orders/orderSlice';
import { fetchProducts } from '../features/products/productSlice';
import api from '../api/client';
import { formatCurrency } from '../utils/format';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const normalizeFormProduct = (product = {}) => {
  const priceValue = Number(product.price || 0);
  const discountedValue = Number(product.discountedPrice || 0);
  const discountPercentage =
    priceValue > 0 && discountedValue > 0 && discountedValue < priceValue
      ? String(Math.round(((priceValue - discountedValue) / priceValue) * 100))
      : '';

  return {
  ...product,
  name: product.name ?? '',
  category: product.category ?? 'Cow',
  imageUrl: product.imageUrl ?? '',
  price: product.price === undefined || product.price === null ? '' : String(product.price),
  discountedPrice:
    product.discountedPrice === undefined || product.discountedPrice === null
      ? ''
      : String(product.discountedPrice),
  discountPercentage,
  description: product.description ?? '',
  stock: product.stock === undefined || product.stock === null ? '' : String(product.stock),
  featured: Boolean(product.featured),
  hotDeal: Boolean(product.hotDeal)
  };
};

const parseNumericField = (value) => {
  if (value === '' || value === null || value === undefined) return Number.NaN;
  const normalized = String(value).replace(/,/g, '').trim();
  return Number(normalized);
};

const calculateDiscountedPrice = (priceValue, discountPercentage) => {
  const parsedPrice = parseNumericField(priceValue);
  const parsedDiscount = parseNumericField(discountPercentage);

  if (Number.isNaN(parsedPrice) || Number.isNaN(parsedDiscount) || parsedDiscount <= 0) {
    return '';
  }

  return String(Number((parsedPrice - (parsedPrice * parsedDiscount) / 100).toFixed(2)));
};

function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { adminStats, adminOrders, adminActivities } = useSelector((state) => state.orders);
  const { items: products } = useSelector((state) => state.products);
  const livestockOptions = ['Cow', 'Goat', 'Ram', 'Sheep', 'Animal Feeds', 'Dairy'];

  const [form, setForm] = useState({
    name: '',
    category: 'Cow',
    imageUrl: '',
    price: '',
    discountedPrice: '',
    discountPercentage: '',
    description: '',
    stock: '',
    featured: true,
    hotDeal: false
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [customerMessages, setCustomerMessages] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [showProducts, setShowProducts] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const toggleProducts = async () => {
    if (showProducts) {
      setShowProducts(false);
      return;
    }

    setShowProducts(true);

    if (productsLoaded) {
      return;
    }

    setProductsLoading(true);

    try {
      await dispatch(fetchProducts()).unwrap();
      setProductsLoaded(true);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Could not load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const toggleMessages = async () => {
    if (showMessages) {
      setShowMessages(false);
      return;
    }

    setShowMessages(true);

    if (messagesLoaded) {
      return;
    }

    setMessagesLoading(true);

    try {
      const { data } = await api.get('/admin/messages');
      setCustomerMessages(data);
      setMessagesLoaded(true);
    } catch {
      setCustomerMessages([]);
      toast.error('Could not load customer messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const toggleActivities = async () => {
    if (showActivities) {
      setShowActivities(false);
      return;
    }

    setShowActivities(true);

    if (activitiesLoaded) {
      return;
    }

    setActivitiesLoading(true);

    try {
      await dispatch(fetchAdminActivities()).unwrap();
      setActivitiesLoaded(true);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Could not load activities');
    } finally {
      setActivitiesLoading(false);
    }
  };

  const analyticsData = useMemo(() => {
    if (!adminStats) return [];
    return [
      { name: 'Users', value: adminStats.usersCount },
      { name: 'Products', value: adminStats.productsCount },
      { name: 'Orders', value: adminStats.ordersCount }
    ];
  }, [adminStats]);

  const addProduct = async () => {
    try {
      if (!form.name.trim() || !form.imageUrl.trim() || form.price === '') {
        toast.error('Please fill in required fields');
        return;
      }

      const price = parseNumericField(form.price);
      const discountPercentage =
        form.discountPercentage === '' || form.discountPercentage === null || form.discountPercentage === undefined
          ? 0
          : parseNumericField(form.discountPercentage);
      const discountedPrice = discountPercentage > 0 ? Number((price - (price * discountPercentage) / 100).toFixed(2)) : 0;
      const stock =
        form.stock === '' || form.stock === null || form.stock === undefined ? 0 : parseNumericField(form.stock);

      const payload = {
        name: form.name,
        category: form.category,
        imageUrl: form.imageUrl,
        description: form.description,
        featured: form.featured,
        hotDeal: form.hotDeal,
        price,
        discountedPrice,
        stock
      };

      if (Number.isNaN(price) || Number.isNaN(discountedPrice) || Number.isNaN(stock) || Number.isNaN(discountPercentage)) {
        toast.error('Price, discounted price, and stock must be valid numbers');
        return;
      }

      if (discountPercentage < 0 || discountPercentage > 100) {
        toast.error('Discount percentage must be between 0 and 100');
        return;
      }

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success('Product updated successfully');
        setEditingId(null);
      } else {
        await api.post('/products', payload);
        toast.success('Product added successfully');
      }

      setForm({
        name: '',
        category: 'Cow',
        imageUrl: '',
        price: '',
        discountedPrice: '',
        discountPercentage: '',
        description: '',
        stock: '',
        featured: true,
        hotDeal: false
      });

      dispatch(fetchProducts());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const editProduct = (product) => {
    setForm(normalizeFormProduct(product));
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteDialog = (productId) => {
    setDeleteProductId(productId);
    setDeleteDialogOpen(true);
  };

  const deleteProduct = async () => {
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteProductId}`);
      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
      setDeleteProductId(null);
      dispatch(fetchProducts());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadingImage(true);

    try {
      const body = new FormData();
      body.append('image', file);
      const { data } = await api.post('/upload', body, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setForm((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const sendReply = async (messageId) => {
    const adminReply = (replyDrafts[messageId] || '').trim();
    if (!adminReply) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      const { data } = await api.patch(`/admin/messages/${messageId}/reply`, { adminReply });
      setCustomerMessages((prev) => prev.map((msg) => (msg._id === messageId ? data : msg)));
      setReplyDrafts((prev) => ({ ...prev, [messageId]: '' }));
      toast.success('Reply sent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send reply');
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h3" sx={{ fontWeight: 800 }}>Admin Dashboard</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card><CardContent>
            <Typography variant="h6">Sales Analytics</Typography>
            <Typography variant="h4" color="success.main">{formatCurrency(adminStats?.revenue || 0)}</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analyticsData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#2e7d32" /></BarChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card><CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Add Product</Typography>
            <Stack spacing={1}>
              <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <TextField select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {livestockOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
              <Button variant="outlined" component="label" disabled={uploadingImage}>
                {uploadingImage ? 'Uploading image...' : 'Browse Image'}
                <input hidden accept="image/*" type="file" onChange={uploadImage} />
              </Button>
              {uploadingImage && <CircularProgress size={20} />}
              {uploadError && <Alert severity="error">{uploadError}</Alert>}
              <TextField label="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              {form.imageUrl && (
                <Stack sx={{ border: '1px solid #dce6dd', borderRadius: 2, p: 1 }}>
                  <Typography variant="caption" color="text.secondary">Image preview</Typography>
                  <img
                    src={form.imageUrl}
                    alt="Product preview"
                    style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8 }}
                  />
                </Stack>
              )}
              <TextField
                label="Price (NGN)"
                value={form.price}
                onChange={(e) => {
                  const price = e.target.value;
                  const discountedPrice = calculateDiscountedPrice(price, form.discountPercentage);
                  setForm({ ...form, price, discountedPrice });
                }}
              />
              <TextField
                label="Discount (%)"
                value={form.discountPercentage}
                onChange={(e) => {
                  const discountPercentage = e.target.value;
                  const discountedPrice = calculateDiscountedPrice(form.price, discountPercentage);

                  setForm({ ...form, discountPercentage, discountedPrice });
                }}
              />
              <TextField
                label="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
              <TextField multiline minRows={2} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Button variant="contained" onClick={addProduct}>
                {editingId ? 'Update Product' : 'Create Product'}
              </Button>
              {editingId && (
                <Button variant="outlined" onClick={() => {
                  setEditingId(null);
                  setForm({
                    name: '',
                    category: 'Cow',
                    imageUrl: '',
                    price: '',
                    discountedPrice: '',
                    discountPercentage: '',
                    description: '',
                    stock: '',
                    featured: true,
                    hotDeal: false
                  });
                }}>
                  Cancel Edit
                </Button>
              )}
            </Stack>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card><CardContent>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">Manage Products</Typography>
          <IconButton onClick={toggleProducts} aria-label={showProducts ? 'Hide products' : 'Show products'}>
            {showProducts ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Stack>

        {showProducts && (
          <Stack spacing={2}>
            {productsLoading && <CircularProgress size={20} />}
            {!productsLoading && products.length === 0 && (
              <Typography variant="body2" color="text.secondary">No products yet.</Typography>
            )}
            {!productsLoading && products.map((product) => (
              <Stack
                key={product._id}
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                sx={{ border: '1px solid #dce6dd', borderRadius: 2, p: 2 }}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                />
                <Stack sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {product.category} • Stock: {product.stock}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                    {formatCurrency(product.discountedPrice && product.discountedPrice < product.price ? product.discountedPrice : product.price)}
                    {product.discountedPrice && product.discountedPrice < product.price && (
                      <Typography component="span" variant="caption" sx={{ ml: 1, textDecoration: 'line-through', color: 'text.secondary' }}>
                        {formatCurrency(product.price)}
                      </Typography>
                    )}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => editProduct(product)}
                    sx={{ color: 'primary.main' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => openDeleteDialog(product._id)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent></Card>

      <Card><CardContent>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">Customer Messages</Typography>
          <IconButton onClick={toggleMessages} aria-label={showMessages ? 'Hide customer messages' : 'Show customer messages'}>
            {showMessages ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Stack>

        {showMessages && (
          <Stack spacing={1.5}>
            {messagesLoading && <CircularProgress size={20} />}
            {!messagesLoading && customerMessages.length === 0 && (
              <Typography variant="body2" color="text.secondary">No customer messages yet.</Typography>
            )}
            {!messagesLoading && customerMessages.map((msg) => (
              <Stack key={msg._id} spacing={1} sx={{ border: '1px solid #dce6dd', borderRadius: 2, p: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                  <Typography sx={{ fontWeight: 700 }}>{msg.subject}</Typography>
                  <Chip
                    size="small"
                    label={msg.status}
                    color={msg.status === 'Replied' ? 'success' : 'warning'}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  From: {msg.user?.name || (msg.source === 'newsletter' ? 'Newsletter Subscriber' : 'Unknown')} ({msg.user?.email || msg.senderEmail || 'N/A'})
                </Typography>
                {msg.source === 'newsletter' ? <Chip size="small" color="info" label="Newsletter" sx={{ width: 'fit-content' }} /> : null}
                <Typography>{msg.message}</Typography>
                {msg.adminReply ? (
                  <Typography variant="body2" sx={{ color: '#1b5e20', fontWeight: 600 }}>
                    Admin reply: {msg.adminReply}
                  </Typography>
                ) : null}
                <TextField
                  size="small"
                  label="Reply"
                  value={replyDrafts[msg._id] || ''}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [msg._id]: e.target.value }))}
                />
                <Button sx={{ width: 'fit-content' }} variant="outlined" onClick={() => sendReply(msg._id)}>
                  Send Reply
                </Button>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent></Card>

      <Card><CardContent>
        <Typography variant="h6">Manage Orders</Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {adminOrders.map((order) => (
            <Stack key={order._id} direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ border: '1px solid #dce6dd', borderRadius: 2, p: 1 }}>
              <Typography sx={{ flex: 1 }}>#{order._id.slice(-6)} - {order.user?.email}</Typography>
              <TextField
                select
                size="small"
                value={order.status}
                onChange={(e) => dispatch(updateOrderStatus({ id: order._id, status: e.target.value }))}
              >
                {['Pending', 'Shipped', 'Delivered'].map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
            </Stack>
          ))}
        </Stack>
      </CardContent></Card>

      <Card><CardContent>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Typography variant="h6">Activity Monitor</Typography>
          <IconButton onClick={toggleActivities} aria-label={showActivities ? 'Hide activities' : 'Show activities'}>
            {showActivities ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Stack>

        {showActivities && (
          <Stack spacing={1}>
            {activitiesLoading && <CircularProgress size={20} />}
            {!activitiesLoading && adminActivities.length === 0 && (
              <Typography variant="body2" color="text.secondary">No activity yet.</Typography>
            )}
            {!activitiesLoading && adminActivities.map((activity, index) => (
              <Stack
                key={`${activity.type}-${activity.happenedAt}-${index}`}
                direction={{ xs: 'column', md: 'row' }}
                spacing={1}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                sx={{ border: '1px solid #dce6dd', borderRadius: 2, p: 1 }}
              >
                <Chip size="small" color="success" label={activity.type.replaceAll('_', ' ')} />
                <Typography sx={{ flex: 1 }}>{activity.title}: {activity.details}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(activity.happenedAt).toLocaleString()}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent></Card>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this product? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={deleteProduct}
            disabled={deleting}
            color="error"
            variant="contained"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default AdminDashboardPage;
