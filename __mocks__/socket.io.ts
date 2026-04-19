import type { AppSocket } from '@/transport/types';

export class MockedSocket1 implements Partial<AppSocket> {
  public emit = jest.fn();
  public on = jest.fn();
  public to = jest.fn().mockReturnThis();
  public join = jest.fn((room) => {
    this.rooms.add(room);
  });
  public leave = jest.fn((room) => {
    this.rooms.delete(room);
  });
  public disconnect = jest.fn();
  public rooms = new Set<string>();
  public handshake = { auth: {} } as AppSocket['handshake'];
  public data: AppSocket['data'] = {};
}

export const MockedSocket = jest.fn(() => new MockedSocket1()) as unknown as jest.Mock<AppSocket>;
