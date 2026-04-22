export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount || 0);
