const mongoose = require('mongoose');

const serviceFeedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likedService: { type: Boolean, required: true },
    comment: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

serviceFeedbackSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ServiceFeedback', serviceFeedbackSchema);
