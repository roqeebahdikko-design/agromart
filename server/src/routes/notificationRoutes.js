const express = require('express');
const { protect } = require('../middlewares/auth');
const {
	contactAdmin,
	subscribeNewsletter,
	getMyContactMessages,
	submitServiceFeedback,
	getMyServiceFeedback
} = require('../controllers/notificationController');

const router = express.Router();

router.post('/newsletter-subscribe', subscribeNewsletter);
router.post('/contact-admin', protect, contactAdmin);
router.get('/contact-admin/mine', protect, getMyContactMessages);
router.post('/service-feedback', protect, submitServiceFeedback);
router.get('/service-feedback/mine', protect, getMyServiceFeedback);

module.exports = router;
