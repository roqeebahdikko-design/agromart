const mongoose = require('mongoose');

/**
 * Safely hides credentials in MongoDB URI for logging
 */
const redactMongoUri = (uri) => {
  if (!uri) return '(missing)';

  try {
    const url = new URL(uri);

    const username = url.username;
    const password = url.password;

    if (username) url.username = '***';
    if (password) url.password = '***';

    return url.toString();
  } catch {
    return uri.replace(/(mongodb(\+srv)?:\/\/)(.*?):(.*?)@/, '$1***:***@');
  }
};

/**
 * MongoDB connection event handlers
 */
const registerMongoEvents = () => {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB event: connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', async () => {
    console.warn('MongoDB disconnected. Attempting reconnect...');

    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB reconnected successfully');
    } catch (err) {
      console.error('MongoDB reconnect failed:', err.message);
    }
  });
};

/**
 * Build structured MongoDB connection errors
 */
const buildMongoConnectionError = (mongoUri, error) => {
  const message = error instanceof Error ? error.message : String(error);

  if (/Invalid scheme|must start with "mongodb:\/\/" or "mongodb\+srv:\/\//i.test(message)) {
    return new Error(
      `MongoDB connection failed: invalid URI scheme. Expected mongodb:// or mongodb+srv://, got ${redactMongoUri(mongoUri)}`,
      { cause: error }
    );
  }

  if (/Server selection timed out|MongooseServerSelectionError|MongoServerSelectionError/i.test(message)) {
    const timeoutMs = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000);

    return new Error(
      `MongoDB connection failed: server selection timed out after ${timeoutMs}ms. Check Atlas network access and cluster status.`,
      { cause: error }
    );
  }

  return new Error(`MongoDB connection failed: ${message}`, { cause: error });
};

/**
 * Main DB connection function
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const mongoDbName = process.env.MONGO_DB_NAME || 'agromart';

  if (!mongoUri) {
    throw new Error('MONGO_URI is required in environment variables.');
  }

  // Better query behavior
  mongoose.set('strictQuery', true);

  // Register events once
  registerMongoEvents();

  try {
    await mongoose.connect(mongoUri, {
      dbName: mongoDbName,
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 50),
      minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 10),
      maxIdleTimeMS: Number(process.env.MONGO_MAX_IDLE_MS || 300000),
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
      socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 30000)
    });

    console.log(`MongoDB connected successfully (db: ${mongoDbName})`);
  } catch (error) {
    throw buildMongoConnectionError(mongoUri, error);
  }
};

module.exports = connectDB;