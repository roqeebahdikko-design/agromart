import { Button, Card, CardContent, IconButton, Stack, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { changeQuantity, removeFromCart } from '../features/cart/cartSlice';
import { formatCurrency } from '../utils/format';

function CartPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.discountedPrice || item.price) * item.quantity,
    0
  );

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
    toast.success('Cart updated successfully');
  };

  const handleQuantityChange = (id, quantity) => {
    if (quantity <= 0) return;
    dispatch(changeQuantity({ id, quantity: Number(quantity) }));
    toast.success('Cart updated successfully');
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h3" sx={{ fontWeight: 800 }}>Your Cart</Typography>
      {items.map((item) => (
        <Card key={item._id}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src={item.imageUrl} alt={item.name} style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8 }} />
            <Typography sx={{ flex: 1 }}>{item.name}</Typography>
            <TextField
              type="number"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(item._id, e.target.value)}
              sx={{ width: 90 }}
            />
            <Typography>{formatCurrency((item.discountedPrice || item.price) * item.quantity)}</Typography>
            <IconButton onClick={() => handleRemoveItem(item._id)}><DeleteIcon /></IconButton>
          </CardContent>
        </Card>
      ))}
      <Typography variant="h5">Subtotal: {formatCurrency(subtotal)}</Typography>
      <Button component={Link} to="/checkout" variant="contained" color="success" disabled={!items.length}>Proceed to checkout</Button>
    </Stack>
  );
}

export default CartPage;
