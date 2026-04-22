import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Grid, Rating, Stack, TextField, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { addToCart } from '../features/cart/cartSlice';
import { fetchProductDetails, submitReview } from '../features/products/productSlice';
import { formatCurrency } from '../utils/format';

const animalKeywords = ['cow', 'goat', 'sheep'];

function ProductDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected, reviews } = useSelector((state) => state.products);
  const { token } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');

  useEffect(() => {
    dispatch(fetchProductDetails(id));
  }, [dispatch, id]);

  if (!selected) return <Typography>Loading...</Typography>;

  const imageHaystack = `${selected?.name || ''} ${selected?.category || ''} ${selected?.imageUrl || ''}`.toLowerCase();
  const isCowGoatOrSheep = animalKeywords.some((keyword) => imageHaystack.includes(keyword));
  const safeAnimalImage = isCowGoatOrSheep
    ? selected.imageUrl
    : 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1400&q=80';

  const handleAddToCart = () => {
    dispatch(addToCart(selected));
    toast.success('Cart updated successfully');
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <img src={safeAnimalImage} alt={selected.name} style={{ width: '100%', borderRadius: 20 }} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Stack spacing={2}>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>{selected.name}</Typography>
          <Typography>{selected.description}</Typography>
          <Typography variant="h5" color="success.main">{formatCurrency(selected.discountedPrice || selected.price)}</Typography>
          <Typography>Stock: {selected.stock}</Typography>
          <Button variant="contained" color="success" onClick={handleAddToCart}>Add to cart</Button>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h5">Reviews & Ratings</Typography>
            {reviews.map((review) => (
              <Stack key={review._id} sx={{ py: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>{review.user?.name}</Typography>
                <Rating value={review.rating} readOnly />
                <Typography>{review.comment}</Typography>
              </Stack>
            ))}

            {token && (
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Rating value={rating} onChange={(_, val) => setRating(val || 1)} />
                <TextField multiline minRows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
                <Button
                  variant="contained"
                  onClick={async () => {
                    await dispatch(submitReview({ id, payload: { rating, comment } }));
                    dispatch(fetchProductDetails(id));
                    setComment('');
                  }}
                >
                  Submit review
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default ProductDetailsPage;
