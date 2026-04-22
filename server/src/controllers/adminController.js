const Joi = require('joi');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ContactMessage = require('../models/ContactMessage');
const { notifyUser } = require('../config/socket');

const getDashboardStats = async (req, res) => {
  const [usersCount, productsCount, ordersCount, orders] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.find().lean()
  ]);

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);

  res.json({
    usersCount,
    productsCount,
    ordersCount,
    revenue,
    recentOrders: orders.slice(-10).reverse()
  });
};

const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
};

const getActivityFeed = async (req, res) => {
  const [recentUsers, recentProducts, recentOrders] = await Promise.all([
    User.find().select('name email createdAt').sort({ createdAt: -1 }).limit(10).lean(),
    Product.find().select('name category createdAt').sort({ createdAt: -1 }).limit(10).lean(),
    Order.find().populate('user', 'name email').select('status total createdAt updatedAt user').sort({ updatedAt: -1 }).limit(15).lean()
  ]);

  const activities = [
    ...recentUsers.map((user) => ({
      type: 'USER_REGISTERED',
      happenedAt: user.createdAt,
      title: 'New user registered',
      details: `${user.name || 'User'} (${user.email})`
    })),
    ...recentProducts.map((product) => ({
      type: 'PRODUCT_CREATED',
      happenedAt: product.createdAt,
      title: 'Product added',
      details: `${product.name} in ${product.category}`
    })),
    ...recentOrders.map((order) => ({
      type: 'ORDER_ACTIVITY',
      happenedAt: order.updatedAt || order.createdAt,
      title: `Order ${order.status}`,
      details: `#${order._id.toString().slice(-6)} by ${order.user?.email || 'Unknown user'} - $${Number(order.total || 0).toFixed(2)}`
    }))
  ]
    .sort((a, b) => new Date(b.happenedAt) - new Date(a.happenedAt))
    .slice(0, 30);

  res.json({ activities });
};

const getCustomerMessages = async (req, res) => {
  const messages = await ContactMessage.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.json(messages);
};

const replyCustomerMessage = async (req, res) => {
  const schema = Joi.object({
    adminReply: Joi.string().trim().min(1).required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    {
      adminReply: value.adminReply,
      status: 'Replied',
      repliedAt: new Date()
    },
    { returnDocument: 'after' }
  ).populate('user', 'name email');

  if (!message) return res.status(404).json({ message: 'Message not found' });

  if (message.user?._id) {
    notifyUser(message.user._id.toString(), 'message:reply', {
      messageId: message._id,
      subject: message.subject,
      adminReply: message.adminReply,
      status: message.status,
      repliedAt: message.repliedAt,
      source: message.source || 'contact'
    });
  }

  res.json(message);
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  getActivityFeed,
  getCustomerMessages,
  replyCustomerMessage
};
