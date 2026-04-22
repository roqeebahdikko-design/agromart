const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    discountedPrice: { type: Number }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ['Pending', 'Shipped', 'Delivered'],
      default: 'Pending'
    },
    shippingAddress: { type: String, required: true },
    deliveryLocation: {
      latitude: Number,
      longitude: Number,
      notes: String
    },
    estimatedDeliveryAt: { type: Date, required: true },
    deliveredAt: Date,
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
