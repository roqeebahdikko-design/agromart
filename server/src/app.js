
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

app.use(helmet());

app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    process.env.CLIENT_URL_2,
    'http://localhost:5173'
  ],
  credentials: true
}));


app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(passport.initialize());


app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
}));


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Agromart API is running...' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);


const uploadsPath = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath));

app.use(notFound);
app.use(errorHandler);

module.exports = app;