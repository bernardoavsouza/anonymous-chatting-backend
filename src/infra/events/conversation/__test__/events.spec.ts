import { getDummyMessage, MockedSocket } from '@/__mocks__/socket.io';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation events tests', () => {
  let socket: jest.Mocked<Socket>;
  let app: TestingModule;

  beforeAll(async () => {
    socket = MockedSocket();
    app = await Test.createTestingModule({
      providers: [ConversationGateway],
    }).compile();
  });

  it('should forward content for the same room on "message" event', () => {
    const messageData = getDummyMessage();

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
