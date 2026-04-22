const Joi = require('joi');
const ServiceFeedback = require('../models/ServiceFeedback');
const ContactMessage = require('../models/ContactMessage');

const contactAdmin = async (req, res) => {
  const schema = Joi.object({
    subject: Joi.string().required(),
    message: Joi.string().required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const savedMessage = await ContactMessage.create({
    user: req.user._id,
    senderEmail: req.user.email,
    source: 'contact',
    subject: value.subject,
    message: value.message
  });

  res.json({
    message: 'Message sent to admin successfully',
    payload: savedMessage
  });
};

const subscribeNewsletter = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const existing = await ContactMessage.findOne({
    source: 'newsletter',
    senderEmail: value.email
  });

  if (existing) {
    return res.json({ message: 'Email already subscribed' });
  }

  await ContactMessage.create({
    senderEmail: value.email,
    source: 'newsletter',
    subject: 'Newsletter Subscription',
    message: `${value.email} subscribed to the newsletter.`
  });

  return res.status(201).json({ message: 'Subscribed successfully' });
};

const getMyContactMessages = async (req, res) => {
  const messages = await ContactMessage.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json(messages);
};

const submitServiceFeedback = async (req, res) => {
  const schema = Joi.object({
    likedService: Joi.boolean().required(),
    comment: Joi.string().allow('').max(1000)
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const feedback = await ServiceFeedback.create({
    user: req.user._id,
    likedService: value.likedService,
    comment: value.comment
  });

  res.status(201).json({ message: 'Feedback submitted successfully', feedback });
};

const getMyServiceFeedback = async (req, res) => {
  const feedback = await ServiceFeedback.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
  res.json(feedback);
};

module.exports = {
  contactAdmin,
  subscribeNewsletter,
  getMyContactMessages,
  submitServiceFeedback,
  getMyServiceFeedback
};
