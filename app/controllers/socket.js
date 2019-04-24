exports.socket = (socket) => {
  console.log('socket connection')
  socket.on('sendGroupMsg', function (data) {
    socket.broadcast.emit('receiveGroupMsg', data);
  });

  // 上线
  socket.on('online', name => {
    console.log('name', name)
    socket.broadcast.emit('online', name)
  });
};