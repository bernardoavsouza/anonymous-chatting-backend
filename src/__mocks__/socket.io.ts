import type { Conversation } from '@/core/conversation.interface';
import type { Message } from '@/core/message.interface';
import type { User } from '@/core/user.interface';
import type { Socket } from 'socket.io';

export const MockedSocket = jest.fn().mockImplementation(
  () =>
    ({
      emit: jest.fn(),
      on: jest.fn(),
      to: jest.fn().mockReturnThis(),
      join: jest.fn(),
      leave: jest.fn(),
      disconnect: jest.fn(),
      rooms: new Set<string>(),
    }) as unknown as jest.Mocked<Socket>,
);

export const dummyMessage: Message = {
  content: 'dummy message',
  conversationId: 'dummy conversationId',
  senderId: 'dummy senderId',
};

export const dummyUser: User = {
  id: 'dummy id',
  nickname: 'dummy nickname',
};

export const dummyConversation: Conversation = {
  id: 'dummy id',
  createdAt: new Date('2025-07-08T14:24:35.407Z'),
};
