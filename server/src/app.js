const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { notFound, errorHandler } = require('./middlewares/error');

const app = express();
const uploadsPath = path.join(__dirname, '../../uploads');

app.use(helmet());
const allowedOrigins = [process.env.CLIENT_URL, process.env.CLIENT_URL_2].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);
      const isSurge = /^https?:\/\/[a-z0-9-]+\.surge\.sh$/i.test(origin);
      const isLocalTunnel = /^https?:\/\/[a-z0-9-]+\.loca\.lt$/i.test(origin);

      if (isLocalhost || isSurge || isLocalTunnel || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS blocked for this origin'));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(passport.initialize());

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

const clientDistPath = path.join(__dirname, '../../client/dist');
const clientIndexPath = path.join(clientDistPath, 'index.html');

if (fs.existsSync(clientIndexPath)) {
  app.use(express.static(clientDistPath));

  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(clientIndexPath);
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
