const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      required: true,
      enum: ['Cow', 'Goat', 'Ram', 'Sheep', 'Animal Feeds', 'Dairy']
    },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    description: { type: String, required: true },
    stock: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    hotDeal: { type: Boolean, default: false },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

productSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
