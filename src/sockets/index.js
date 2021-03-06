import User from '../models/user';

const logUserConnection = (userId) => {
  User.findByIdAndUpdate(userId, { $set: { lastConnection: new Date() } }, (err) => { if (err) console.log(err); });
}

const connection = socket => {
  socket.on('userConnection', userId => {
    socket.join(userId);
    logUserConnection(userId);
  });

  socket.on('sendFile', ({ roomId, file }) => {
    socket.join(roomId);
    socket.to(roomId).emit('recieveFile', file);
    socket.leave(roomId);
    // sendFileReceivedPushNotification(roomId, file.name);
  });

  socket.on('sendRequest', ({ roomId, friendRequest }) => {
    socket.join(roomId);
    socket.to(roomId).emit('receiveFriendRequest', friendRequest);
    socket.leave(roomId);
    // sendFileReceivedPushNotification(roomId, file.name);
  });

  socket.on('acceptRequest', ({ roomId, friend }) => {
    socket.join(roomId);
    socket.to(roomId).emit('newFriend', friend);
    socket.leave(roomId);
  });

  socket.on('removeFileFromRoom', ({ roomId, index }) => {
    socket.to(roomId).emit('removeFile', index);
  });

  socket.on('updatedUser', ({ roomId, token }) => {
    socket.to(roomId).emit('updateUser', token);
  });

  socket.on('addLink', ({ roomId, link }) => {
    socket.to(roomId).emit('newLink', link);
  });

  socket.on('removeLinkFromRoom', ({ roomId, index }) => {
    socket.broadcast.to(roomId).emit('removeLink', index);
  });

  socket.on('addSentFile', ({ roomId, file }) => {
    socket.broadcast.to(roomId).emit('receiveSentFile', file);
  });

  socket.on('removeSentFileFromRoom', ({ roomId, id }) => {
    socket.broadcast.to(roomId).emit('removeSentFile', id);
  });

  socket.on('removeFileByIdFromRoom', ({ roomId, id }) => {
    socket.broadcast.to(roomId).emit('removeFileById', id);
  });

  socket.on('removeLinkByIdFromRoom', ({ roomId, id }) => {
    socket.broadcast.to(roomId).emit('removeLinkById', id);
  })

  socket.on('logout', () => {
    socket.disconnect();
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
};


export default connection;
