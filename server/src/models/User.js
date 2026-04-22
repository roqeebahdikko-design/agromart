const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    googleId: { type: String },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    lastPurchase: {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      total: Number,
      at: Date
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function userPreSave() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
