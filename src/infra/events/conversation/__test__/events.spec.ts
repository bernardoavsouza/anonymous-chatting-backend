import type { Socket } from 'socket.io';
import { ConversationGateway } from '../gateway';
import type { Message } from 'src/core/message.interface';
import { Test, type TestingModule } from '@nestjs/testing';

describe('Conversation events tests', () => {
  let socket: Socket;
  let app: TestingModule;
  beforeAll(() => {
    socket = {
      emit: jest.fn(),
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    } as unknown as Socket;
  });

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [ConversationGateway],
    }).compile();
  });

  it('should forward content for the same room on "message" event', () => {
    const messageData: Message = {
      content: 'dummy message',
      conversationId: 'dummy conversationId',
      senderId: 'dummy senderId',
      timestamp: new Date(2020, 1, 2, 3, 4, 5, 6),
    };

    const conversationGateway =
      app.get<ConversationGateway>(ConversationGateway);
    conversationGateway.handleMessage(messageData, socket);

    expect(socket.to).toHaveBeenCalledWith(messageData.conversationId);
    expect(socket.to(messageData.conversationId).emit).toHaveBeenCalledWith(
      'message',
      messageData,
    );
  });
});
