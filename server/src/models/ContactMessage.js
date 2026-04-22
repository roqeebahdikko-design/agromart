const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    senderEmail: { type: String, trim: true },
    source: {
      type: String,
      enum: ['contact', 'newsletter'],
      default: 'contact'
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    adminReply: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Replied'],
      default: 'Pending'
    },
    repliedAt: { type: Date }
  },
  { timestamps: true }
);

contactMessageSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);