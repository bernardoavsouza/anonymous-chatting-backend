import { ServerUrl } from './server-utils';

describe('URL Parser Class', () => {
  test('The class should be a singleton', () => {
    const firstInstance = ServerUrl.getInstance();
    const secondInstance = ServerUrl.getInstance();
    expect(firstInstance).toBe(secondInstance);
  });

  test('The returned class should only have protocol, host, port and url attributes', () => {
    const serverUrl = ServerUrl.getInstance();
    const attributes = Object.keys(serverUrl);
    expect(attributes).toEqual(['protocol', 'host', 'port', 'url']);
  });

  test('Class attributes should be right', () => {
    const serverUrl = ServerUrl.getInstance();
    const protocol = process.env.PROTOCOL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = +(process.env.PORT || '3000');
    const url = `${protocol}://${host}:${port}`;

    expect(serverUrl.protocol).toBe(protocol);
    expect(serverUrl.host).toBe(host);
    expect(serverUrl.port).toBe(port);
    expect(serverUrl.url).toBe(url);
  });
});
