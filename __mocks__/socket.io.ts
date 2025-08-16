import type { Socket } from 'socket.io';

export class MockedSocket1 implements Partial<Socket> {
  public emit = jest.fn();
  public on = jest.fn();
  public to = jest.fn().mockReturnThis();
  public join = jest.fn((room) => {
    this.rooms.add(room);
  });
  public leave = jest.fn();
  public disconnect = jest.fn();
  public rooms = new Set<string>();
}

export const MockedSocket = jest.fn(
  () => new MockedSocket1(),
) as unknown as jest.Mock<Socket>;
