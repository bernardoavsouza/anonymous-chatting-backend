import type { Conversation } from '@/core/conversation.interface';
import type { Message } from '@/core/message.interface';
import type { User } from '@/core/user.interface';
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

const dummyIds = [
  'a3bb189e-8bf9-4d3f-9e3b-4e2c6f1a1b2c',
  '7c9e6679-7425-40de-944b-e07fc1f90ae7',
];

export const dummyTimestamp = '2025-07-08T14:24:35.407Z';
export const dummyDate = new Date(dummyTimestamp);

export const dummyMessage: Message = {
  content: 'dummy message',
  conversationId: dummyIds[0] as string,
  senderId: dummyIds[1] as string,
};

export const dummyUser: User = {
  id: dummyIds[1] as string,
  nickname: 'dummy nickname',
};

export const dummyConversation: Conversation = {
  id: dummyIds[0] as string,
  createdAt: dummyDate,
};
