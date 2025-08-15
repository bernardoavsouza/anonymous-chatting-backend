import { MockedSocket, dummyDate, dummyMessage } from '@/__mocks__/socket.io';
import { ConversationService } from '@/application/conversation/service';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation message event', () => {
  let socket: Socket;
  let conversationGateway: ConversationGateway;
  let service: ConversationService;

  const conversationServiceMock = {
    sendMessage: jest.fn(),
  };

  beforeEach(async () => {
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

  it('should call conversation send message service if conversation is found', () => {
    socket.join(dummyMessage.conversationId);

    conversationGateway.handleMessage(
      {
        data: dummyMessage,
        timestamp: dummyDate,
      },
      socket,
    );

    expect(service.sendMessage).toHaveBeenCalledWith(socket, dummyMessage);
  });

  it('should not call conversation send message service if conversation is not found', () => {
    conversationGateway.handleMessage(
      {
        data: dummyMessage,
        timestamp: dummyDate,
      },
      socket,
    );

    expect(service.sendMessage).not.toHaveBeenCalled();
  });
});
