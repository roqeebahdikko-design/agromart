import { Button, Card, CardActions, CardContent, CardMedia, Chip, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';

function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    toast.success('Cart updated successfully');
  };

  return (
    <Card sx={{ borderRadius: 4, overflow: 'hidden', height: '100%' }}>
      <CardMedia component="img" height="180" image={product.imageUrl} alt={product.name} />
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{product.name}</Typography>
          {product.hotDeal && <Chip label="Hot Deal" color="warning" />}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{product.category}</Typography>
        <Typography variant="h6" color="success.main">{formatCurrency(product.discountedPrice || product.price)}</Typography>
        {product.discountedPrice && (
          <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>{formatCurrency(product.price)}</Typography>
        )}
      </CardContent>
      <CardActions>
        <Button component={Link} to={`/products/${product._id}`} size="small">Details</Button>
        <Button size="small" variant="contained" color="success" onClick={handleAddToCart}>Add to cart</Button>
      </CardActions>
    </Card>
  );
}

export default ProductCard;
