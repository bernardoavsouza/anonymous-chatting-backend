import { wsServer } from './config/servers/ws-server';

wsServer.on('connection', (socket) => {
  socket.on('message', () => {
    wsServer.emit('message', 'Hello world!');
  });
});
