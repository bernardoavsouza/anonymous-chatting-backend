import type { Message } from '@/core/message.interface';
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
    }) as unknown as jest.Mocked<Socket>,
);

export const getDummyMessage: () => Message = () => ({
  content: 'dummy message',
  conversationId: 'dummy conversationId',
  senderId: 'dummy senderId',
  timestamp: new Date(),
});
