import { wsServer } from './config/server';
import { io as Client } from 'socket.io-client';
import { createServer } from 'http';

describe('Ensure that the websocket server working fine', () => {
  let client;
  const httpServer = createServer();
  const protocol = process.env.protocol || 'http';
  const host = process.env.host || 'localhost';
  const port = +(process.env.port || '3000');

  beforeAll((done) => {
    wsServer.attach(httpServer);
    httpServer.listen(port, host, () => {
      client = Client(`${protocol}://${host}:${port}`);
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
