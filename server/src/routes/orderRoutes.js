const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
