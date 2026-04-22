const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const {
	getDashboardStats,
	getAllUsers,
	getAllOrders,
	getActivityFeed,
	getCustomerMessages,
	replyCustomerMessage
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/orders', getAllOrders);
router.get('/activities', getActivityFeed);
router.get('/messages', getCustomerMessages);
router.patch('/messages/:id/reply', replyCustomerMessage);

module.exports = router;
