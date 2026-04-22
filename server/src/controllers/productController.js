const Joi = require('joi');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');

const toNumericValue = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;

  const normalized = typeof value === 'string' ? value.replace(/,/g, '').trim() : value;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? value : parsed;
};

const listProducts = async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 8);
  const search = req.query.search || '';
  const category = req.query.category || '';
  const hotDeal = req.query.hotDeal === 'true';
  const featured = req.query.featured === 'true';

  const query = {
    name: { $regex: search, $options: 'i' }
  };

  if (category) query.category = category;
  if (hotDeal) query.hotDeal = true;
  if (featured) query.featured = true;

  const [items, total] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(query)
  ]);

  res.json({
    items,
    page,
    totalPages: Math.ceil(total / limit),
    total
  });
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const reviews = await Review.find({ product: product._id }).populate('user', 'name');

  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { recentlyViewed: product._id }
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { recentlyViewed: { $each: [product._id], $position: 0, $slice: 8 } }
    });
  }

  res.json({ product, reviews });
};

const productSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().required(),
  imageUrl: Joi.string().uri().required(),
  price: Joi.number().required(),
  discountedPrice: Joi.number().allow(null),
  description: Joi.string().required(),
  stock: Joi.number().required(),
  featured: Joi.boolean(),
  hotDeal: Joi.boolean()
});

const createProduct = async (req, res) => {
  const payload = {
    ...req.body,
    price: toNumericValue(req.body.price),
    discountedPrice: toNumericValue(req.body.discountedPrice, null),
    stock: toNumericValue(req.body.stock, 0)
  };

  const { error, value } = productSchema.validate(payload);
  if (error) return res.status(400).json({ message: error.message });

  const product = await Product.create(value);
  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const payload = {
    ...req.body,
    price: toNumericValue(req.body.price),
    discountedPrice: toNumericValue(req.body.discountedPrice, null),
    stock: toNumericValue(req.body.stock, 0)
  };

  const { error, value } = productSchema.validate(payload);
  if (error) return res.status(400).json({ message: error.message });

  const updated = await Product.findByIdAndUpdate(req.params.id, value, { returnDocument: 'after' });
  if (!updated) return res.status(404).json({ message: 'Product not found' });

  res.json(updated);
};

const deleteProduct = async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Product not found' });

  res.json({ message: 'Product removed' });
};

const addReview = async (req, res) => {
  const schema = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().allow('')
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  await Review.findOneAndUpdate(
    { user: req.user._id, product: product._id },
    { ...value, user: req.user._id, product: product._id },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );

  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    {
      $group: {
        _id: '$product',
        avg: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  product.ratingAverage = stats[0]?.avg || 0;
  product.ratingCount = stats[0]?.count || 0;
  await product.save();

  res.json({ message: 'Review saved' });
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview
};
