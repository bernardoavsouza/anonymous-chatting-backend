import { wsServer } from './index';

describe('Ensure that the websocket server is running', () => {
  test('It should be running', () => {
    expect(wsServer.active).toBe(true);
    wsServer.close();
  });
});
