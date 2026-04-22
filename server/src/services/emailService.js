const nodemailer = require('nodemailer');

const createTransport = () => {
  if (!process.env.SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendOrderEmail = async ({ to, subject, text }) => {
  const transporter = createTransport();
  if (!transporter) return;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@agromart.com',
    to,
    subject,
    text
  });
};

const sendPaymentReceiptEmail = async ({ to, reference, amount, currency = 'NGN' }) => {
  const transporter = createTransport();
  if (!transporter) return;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@agromart.com',
    to,
    subject: `Agromart Demo Payment Receipt (${reference})`,
    text: `Payment successful. Reference: ${reference}. Amount: ${amount} ${currency}. This is a demo payment receipt.`
  });
};

module.exports = { sendOrderEmail, sendPaymentReceiptEmail };
