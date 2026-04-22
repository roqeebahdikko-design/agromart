const Joi = require('joi');
const { sendPaymentReceiptEmail } = require('../services/emailService');

const confirmDemoPayment = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().default('NGN'),
    reference: Joi.string().required(),
    customerName: Joi.string().allow(''),
    cartItems: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          quantity: Joi.number().min(1).required(),
          unitPrice: Joi.number().min(0).required()
        })
      )
      .default([])
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  await sendPaymentReceiptEmail({
    to: value.email,
    reference: value.reference,
    amount: value.amount,
    currency: value.currency
  });

  return res.json({
    success: true,
    message: 'Demo payment confirmed',
    reference: value.reference
  });
};

module.exports = {
  confirmDemoPayment
};
