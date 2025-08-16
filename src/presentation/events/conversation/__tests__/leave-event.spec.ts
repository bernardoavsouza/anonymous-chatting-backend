import { ConversationService } from '@/application/conversation/service';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyDate, dummyUser } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation leave event', () => {
  let socket: Socket;
  let conversationGateway: ConversationGateway;
  let service: ConversationService;

  const conversationServiceMock = {
    leave: jest.fn(),
  };

  beforeAll(async () => {
    socket = MockedSocket();
    const app = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        {
          provide: ConversationService,
          useValue: conversationServiceMock,
        },
      ],
    }).compile();
    conversationGateway = app.get<ConversationGateway>(ConversationGateway);
    service = app.get<ConversationService>(ConversationService);
  });

  it('should leave room on conversation leave event', () => {
    conversationGateway.handleLeave(
      {
        data: {
          user: dummyUser,
          conversationId: dummyConversation.id,
        },
        timestamp: dummyDate,
      },
      socket,
    );

    expect(service.leave).toHaveBeenCalledWith(socket, {
      conversationId: dummyConversation.id,
      user: dummyUser,
    });
  });
});
