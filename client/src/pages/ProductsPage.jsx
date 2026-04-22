import { useEffect, useState } from 'react';
import { Badge, Box, Button, Grid, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../features/products/productSlice';
import ProductCard from '../components/ProductCard';

const categories = ['', 'Cow', 'Goat', 'Ram', 'Sheep', 'Animal Feeds', 'Dairy'];

function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { items, page, totalPages } = useSelector((state) => state.products);
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(() => {
    const paramValue = (searchParams.get('animal') || searchParams.get('category') || '').toLowerCase();
    if (paramValue.startsWith('cow')) return 'Cow';
    if (paramValue.startsWith('goat')) return 'Goat';
    if (paramValue.startsWith('ram')) return 'Ram';
    if (paramValue.startsWith('sheep')) return 'Sheep';
    if (paramValue.startsWith('dairy')) return 'Dairy';
    if (paramValue.includes('feed')) return 'Animal Feeds';
    return '';
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchProducts({ search, category, page: currentPage, limit: 8 }));
  }, [dispatch, search, category, currentPage]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>Livestock Marketplace</Typography>
        <IconButton component={Link} to="/checkout" color="success" aria-label="go to checkout">
          <Badge badgeContent={cartCount} color="error">
            <ShoppingCartCheckoutIcon />
          </Badge>
        </IconButton>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField label="Search product" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
        <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 220 }}>
          {categories.map((option) => (
            <MenuItem key={option || 'all'} value={option}>{option || 'All categories'}</MenuItem>
          ))}
        </TextField>
      </Stack>
      <Grid container spacing={2}>
        {items.map((product) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product._id}><ProductCard product={product} /></Grid>
        ))}
      </Grid>
      {!items.length && (
        <Typography color="text.secondary">
          No products found for this filter.
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button disabled={page <= 1} onClick={() => setCurrentPage((p) => p - 1)}>Prev</Button>
        <Typography sx={{ pt: 1 }}>Page {page} / {totalPages}</Typography>
        <Button disabled={page >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
      </Box>
    </Stack>
  );
}

export default ProductsPage;
