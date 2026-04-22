const express = require('express');
const { confirmDemoPayment } = require('../controllers/paymentController');

const router = express.Router();

router.post('/demo/confirm', confirmDemoPayment);

module.exports = router;
