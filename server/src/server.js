require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const app = require('./app');
const { configurePassport } = require('./config/passport');
const { registerSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const start = async () => {
  await connectDB();
  configurePassport();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ['GET', 'POST']
    }
  });

  registerSocket(io);

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
      process.exit(1);
    }
    throw error;
  });

  server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
};

start().catch((error) => {
  console.error('Server startup failed.');
  console.error(error);
  process.exit(1);
});