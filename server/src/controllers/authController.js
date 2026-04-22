const Joi = require('joi');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const Order = require('../models/Order');

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const register = async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const exists = await User.findOne({ email: value.email });
  if (exists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create(value);
  const token = generateToken(user._id, user.role);

  res.status(201).json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const user = await User.findOne({ email: value.email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await user.comparePassword(value.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateToken(user._id, user.role);

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      recentlyViewed: user.recentlyViewed,
      lastPurchase: user.lastPurchase
    }
  });
};

const adminLogin = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const user = await User.findOne({ email: value.email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await user.comparePassword(value.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  if (user.role !== 'admin') return res.status(403).json({ message: 'Admin account required' });

  const token = generateToken(user._id, user.role);

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      recentlyViewed: user.recentlyViewed,
      lastPurchase: user.lastPurchase
    }
  });
};

const getProfile = async (req, res) => {
  const purchases = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  res.json({
    user: req.user,
    lastPurchases: purchases
  });
};

const updateProfile = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(2),
    phone: Joi.string().allow(''),
    address: Joi.string().allow('')
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const updated = await User.findByIdAndUpdate(req.user._id, value, {
    returnDocument: 'after'
  }).select('-password');

  res.json(updated);
};

const googleCallbackSuccess = (req, res) => {
  const token = generateToken(req.user._id, req.user.role);
  const redirectBase = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(`${redirectBase}/oauth-success?token=${token}`);
};

module.exports = {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  googleCallbackSuccess
};
