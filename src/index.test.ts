import { wsServer } from './config/server';
import { io as Client, Socket } from 'socket.io-client';
import { createServer } from 'http';
import { ServerUrl } from './utils/server-utils';

describe('Ensure that the websocket server working fine', () => {
  let client: Socket;
  const httpServer = createServer();
  const serverUrl = ServerUrl.getServerData();

  beforeAll((done) => {
    wsServer.attach(httpServer);
    httpServer.listen(serverUrl.port, serverUrl.host, () => {
      client = Client(serverUrl.url);
      done();
    });
  });

  afterAll((done) => {
    client.close();
    wsServer.close(() => {
      done();
    });
  });

  test('It should be running', (done) => {
    client.on('connect', () => {
      expect(client.connected).toBe(true);
      done();
    });
  });
});
