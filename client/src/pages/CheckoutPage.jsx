import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../features/orders/orderSlice';
import { clearCart } from '../features/cart/cartSlice';
import api from '../api/client';
import { formatCurrency } from '../utils/format';

const PAYMENT_METHODS = [
  { value: 'bank-card', label: 'Bank Card' },
  { value: 'bank-transfer', label: 'Bank Transfer' },
  { value: 'paystack', label: 'Paystack' }
];

const CARD_TYPES = ['Visa', 'Mastercard', 'Verve'];
const NIGERIAN_BANKS = ['Access Bank', 'GTBank', 'First Bank', 'UBA', 'Zenith Bank'];
const PAYSTACK_CHANNELS = ['Card', 'Bank Transfer', 'USSD'];

function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.auth);

  const [shippingAddress, setShippingAddress] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [paymentMethod, setPaymentMethod] = useState('bank-card');
  const [paymentDetails, setPaymentDetails] = useState({
    bankCard: {
      cardType: '',
      issuingBank: '',
      cardHolderName: ''
    },
    bankTransfer: {
      bankName: '',
      accountName: '',
      transferReference: ''
    },
    paystack: {
      channel: '',
      payerPhone: ''
    }
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccessOpen, setPaymentSuccessOpen] = useState(false);
  const [successReference, setSuccessReference] = useState('');

  const subtotal = items.reduce(
    (sum, item) => sum + (item.discountedPrice || item.price) * item.quantity,
    0
  );
  const shippingFee = subtotal > 50000 ? 0 : 2500;
  const total = subtotal + shippingFee;

  const isOnlineMethod = paymentMethod === 'paystack';

  const updatePaymentDetails = (section, field, value) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const validatePaymentDetails = () => {
    if (paymentMethod === 'bank-card') {
      const { cardType, issuingBank, cardHolderName } = paymentDetails.bankCard;
      if (!cardType || !issuingBank || !cardHolderName.trim()) {
        return 'Please provide card type, issuing bank, and card holder name.';
      }
    }

    if (paymentMethod === 'bank-transfer') {
      const { bankName, accountName, transferReference } = paymentDetails.bankTransfer;
      if (!bankName || !accountName.trim() || !transferReference.trim()) {
        return 'Please provide transfer bank, account name, and transfer reference.';
      }
    }

    if (paymentMethod === 'paystack') {
      const { channel, payerPhone } = paymentDetails.paystack;
      if (!channel || !payerPhone.trim()) {
        return 'Please provide paystack channel and payer phone number.';
      }
    }

    return '';
  };

  const submit = async () => {
    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }
    if (!shippingAddress.trim()) {
      setError('Shipping address is required.');
      return;
    }
    if (isOnlineMethod && !email.trim()) {
      setError('Email is required for payment receipt.');
      return;
    }

    const paymentDetailsError = validatePaymentDetails();
    if (paymentDetailsError) {
      setError(paymentDetailsError);
      return;
    }

    setError('');
    setProcessing(true);

    try {
      const reference = `PSK-DEMO-${Date.now()}`;

      if (isOnlineMethod) {
        await api.post('/payments/demo/confirm', {
          email,
          amount: total,
          currency: 'NGN',
          reference,
          customerName: user?.name || 'Guest Customer',
          cartItems: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.discountedPrice || item.price
          }))
        });
      }

      if (token) {
        const methodDetailNote =
          paymentMethod === 'bank-card'
            ? `Payment method: bank-card | Type: ${paymentDetails.bankCard.cardType} | Bank: ${paymentDetails.bankCard.issuingBank} | Holder: ${paymentDetails.bankCard.cardHolderName}`
            : paymentMethod === 'bank-transfer'
              ? `Payment method: bank-transfer | Bank: ${paymentDetails.bankTransfer.bankName} | Account Name: ${paymentDetails.bankTransfer.accountName} | Ref: ${paymentDetails.bankTransfer.transferReference}`
              : `Payment method: paystack | Channel: ${paymentDetails.paystack.channel} | Phone: ${paymentDetails.paystack.payerPhone}`;

        const payload = {
          shippingAddress,
          deliveryLocation: {
            latitude: 0,
            longitude: 0,
            notes: methodDetailNote
          },
          items: items.map((item) => ({
            product: item._id,
            quantity: item.quantity
          })),
          deliveryHours: 24
        };

        const result = await dispatch(createOrder(payload));
        if (result.error) {
          throw new Error(result.payload || 'Could not create order');
        }
      }

      dispatch(clearCart());
      setSuccessReference(reference);
      setPaymentSuccessOpen(true);
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const closeSuccessPrompt = () => {
    setPaymentSuccessOpen(false);
    navigate('/dashboard');
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Checkout</Typography>
          <Chip color="success" label="Secure Checkout" sx={{ width: 'fit-content' }} />

          {error && <Alert severity="error">{error}</Alert>}

          <FormControl>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Payment Method</Typography>
            <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {isOnlineMethod && (
            <TextField
              label="Receipt Email (Gmail)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          {paymentMethod === 'bank-card' && (
            <Stack spacing={1} sx={{ p: 1.5, border: '1px solid #dce6dd', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Bank Card Details</Typography>
              <TextField
                select
                label="Card Type"
                value={paymentDetails.bankCard.cardType}
                onChange={(e) => updatePaymentDetails('bankCard', 'cardType', e.target.value)}
              >
                {CARD_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Issuing Bank"
                value={paymentDetails.bankCard.issuingBank}
                onChange={(e) => updatePaymentDetails('bankCard', 'issuingBank', e.target.value)}
              >
                {NIGERIAN_BANKS.map((bank) => (
                  <MenuItem key={bank} value={bank}>{bank}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Card Holder Name"
                value={paymentDetails.bankCard.cardHolderName}
                onChange={(e) => updatePaymentDetails('bankCard', 'cardHolderName', e.target.value)}
              />
            </Stack>
          )}

          {paymentMethod === 'bank-transfer' && (
            <Stack spacing={1} sx={{ p: 1.5, border: '1px solid #dce6dd', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Bank Transfer Details</Typography>
              <TextField
                select
                label="Transfer Bank"
                value={paymentDetails.bankTransfer.bankName}
                onChange={(e) => updatePaymentDetails('bankTransfer', 'bankName', e.target.value)}
              >
                {NIGERIAN_BANKS.map((bank) => (
                  <MenuItem key={bank} value={bank}>{bank}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Account Name"
                value={paymentDetails.bankTransfer.accountName}
                onChange={(e) => updatePaymentDetails('bankTransfer', 'accountName', e.target.value)}
              />
              <TextField
                label="Transfer Reference"
                value={paymentDetails.bankTransfer.transferReference}
                onChange={(e) => updatePaymentDetails('bankTransfer', 'transferReference', e.target.value)}
              />
            </Stack>
          )}

          {paymentMethod === 'paystack' && (
            <Stack spacing={1} sx={{ p: 1.5, border: '1px solid #dce6dd', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Paystack Details</Typography>
              <TextField
                select
                label="Channel"
                value={paymentDetails.paystack.channel}
                onChange={(e) => updatePaymentDetails('paystack', 'channel', e.target.value)}
              >
                {PAYSTACK_CHANNELS.map((channel) => (
                  <MenuItem key={channel} value={channel}>{channel}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Payer Phone Number"
                value={paymentDetails.paystack.payerPhone}
                onChange={(e) => updatePaymentDetails('paystack', 'payerPhone', e.target.value)}
              />
            </Stack>
          )}

          <TextField label="Shipping Address" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />

          <Stack spacing={0.5} sx={{ p: 1.5, border: '1px solid #dce6dd', borderRadius: 2 }}>
            <Typography variant="body2">Subtotal: {formatCurrency(subtotal)}</Typography>
            <Typography variant="body2">Shipping: {formatCurrency(shippingFee)}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Total: {formatCurrency(total)}</Typography>
          </Stack>

          <Button variant="contained" color="success" onClick={submit} disabled={!items.length || processing}>
            {processing ? 'Processing payment...' : `Complete ${formatCurrency(total)} Payment`}
          </Button>

          <Dialog open={paymentSuccessOpen} onClose={closeSuccessPrompt}>
            <DialogTitle>Payment Successful</DialogTitle>
            <DialogContent>
              <Stack spacing={1} sx={{ minWidth: { xs: 240, sm: 360 }, pt: 0.5 }}>
                <Typography variant="body2">
                  Your payment has been processed successfully.
                </Typography>
                <Typography variant="body2">
                  Method: {PAYMENT_METHODS.find((method) => method.value === paymentMethod)?.label}
                </Typography>
                <Typography variant="body2">Reference: {successReference}</Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={closeSuccessPrompt}>Continue</Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default CheckoutPage;
