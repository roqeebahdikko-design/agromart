const Joi = require('joi');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { notifyUser } = require('../config/socket');
const { sendOrderEmail } = require('../services/emailService');

const createOrder = async (req, res) => {
  const schema = Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          product: Joi.string().required(),
          quantity: Joi.number().min(1).required()
        })
      )
      .min(1)
      .required(),
    shippingAddress: Joi.string().required(),
    deliveryLocation: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      notes: Joi.string().allow('')
    }).required(),
    deliveryHours: Joi.number().min(1).max(72).default(24)
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const ids = value.items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: ids } });

  const mappedItems = value.items.map((item) => {
    const product = products.find((p) => p._id.toString() === item.product);
    if (!product) throw new Error('Invalid product in cart');
    if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

    product.stock -= item.quantity;
    product.save();

    return {
      product: product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      quantity: item.quantity,
      unitPrice: product.price,
      discountedPrice: product.discountedPrice || product.price
    };
  });

  const subtotal = mappedItems.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);
  const shippingFee = subtotal > 500 ? 0 : 30;
  const total = subtotal + shippingFee;

  const estimatedDeliveryAt = new Date(Date.now() + value.deliveryHours * 60 * 60 * 1000);

  const order = await Order.create({
    user: req.user._id,
    items: mappedItems,
    shippingAddress: value.shippingAddress,
    deliveryLocation: value.deliveryLocation,
    estimatedDeliveryAt,
    subtotal,
    shippingFee,
    total
  });

  await User.findByIdAndUpdate(req.user._id, {
    lastPurchase: {
      orderId: order._id,
      total,
      at: new Date()
    }
  });

  notifyUser(req.user._id.toString(), 'order:update', {
    orderId: order._id,
    status: 'Pending',
    message: 'Order confirmed'
  });

  sendOrderEmail({
    to: req.user.email,
    subject: 'Agromart Order Confirmed',
    text: `Your order ${order._id} is confirmed. Estimated delivery: ${estimatedDeliveryAt.toISOString()}.`
  }).catch(() => {});

  res.status(201).json(order);
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  res.json(order);
};

const updateOrderStatus = async (req, res) => {
  const schema = Joi.object({
    status: Joi.string().valid('Pending', 'Shipped', 'Delivered').required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const order = await Order.findById(req.params.id).populate('user', 'email');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = value.status;
  if (value.status === 'Delivered') {
    order.deliveredAt = new Date();
  }

  await order.save();

  notifyUser(order.user._id.toString(), 'order:update', {
    orderId: order._id,
    status: order.status,
    message: `Order ${order.status}`
  });

  sendOrderEmail({
    to: order.user.email,
    subject: `Agromart Order ${order.status}`,
    text: `Order ${order._id} status changed to ${order.status}.`
  }).catch(() => {});

  res.json(order);
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus
};
