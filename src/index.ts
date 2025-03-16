import { wsServer } from './config/servers/ws-server';

wsServer.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
