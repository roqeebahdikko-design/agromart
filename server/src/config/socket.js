let ioInstance;

const registerSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
    });

    socket.on('disconnect', () => {});
  });
};

const notifyUser = (userId, event, payload) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user-${userId}`).emit(event, payload);
};

module.exports = {
  registerSocket,
  notifyUser
};
