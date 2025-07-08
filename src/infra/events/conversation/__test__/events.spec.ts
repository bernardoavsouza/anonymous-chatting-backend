import {
  dummyConversation,
  dummyMessage,
  dummyUser,
  MockedSocket,
} from '@/__mocks__/socket.io';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { ConversationGateway } from '../gateway';
import { ConversationEvent } from '../types';

describe('Conversation events tests', () => {
  let socket: jest.Mocked<Socket>;
  let conversationGateway: ConversationGateway;

  beforeAll(async () => {
    socket = MockedSocket();
    const app = await Test.createTestingModule({
      providers: [ConversationGateway],
    }).compile();

    conversationGateway = app.get<ConversationGateway>(ConversationGateway);
  });

  it('should forward content for the same room on "message" event', () => {
    conversationGateway.handleMessage(
      { data: dummyMessage, timestamp: new Date() },
      socket,
    );

    expect(socket.to).toHaveBeenCalledWith(dummyMessage.conversationId);
    expect(socket.to(dummyMessage.conversationId).emit).toHaveBeenCalledWith(
      ConversationEvent.MESSAGE,
      dummyMessage,
    );
  });

  it('should join room on conversation join event', () => {
    conversationGateway.handleJoin(
      {
        data: {
          user: dummyUser,
          conversationId: dummyConversation.id,
        },
        timestamp: new Date(),
      },
      socket,
    );

    expect(socket.join).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should leave room on conversation leave event', () => {
    conversationGateway.handleLeave(
      {
        data: {
          user: dummyUser,
          conversationId: dummyConversation.id,
        },
        timestamp: new Date(),
      },
      socket,
    );

    expect(socket.leave).toHaveBeenCalledWith(dummyConversation.id);
  });
});
