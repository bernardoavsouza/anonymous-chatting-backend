import { ConversationService } from '@/application/conversation/service';
import { RedisService } from '@/application/redis/service';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyDate, dummyMessage } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation message event', () => {
  let socket: Socket;
  let conversationGateway: ConversationGateway;
  let conversationService: ConversationService;
  let redisService: RedisService;

  const conversationServiceMock = {
    sendMessage: jest.fn(),
  };

  const redisServiceMock = {
    appendMessage: jest.fn(),
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
        {
          provide: RedisService,
          useValue: redisServiceMock,
        },
      ],
    }).compile();
    conversationGateway = app.get<ConversationGateway>(ConversationGateway);
    conversationService = app.get<ConversationService>(ConversationService);
    redisService = app.get<RedisService>(RedisService);
  });

  it('should call conversation send message conversationService if conversation is found', () => {
    socket.join(dummyMessage.conversationId);

    conversationGateway.handleMessage(
      {
        data: dummyMessage,
        timestamp: dummyDate,
      },
      socket,
    );

    expect(conversationService.sendMessage).toHaveBeenCalledWith(
      socket,
      dummyMessage,
    );
  });

  it('should not call conversation send message conversationService if conversation is not found', () => {
    conversationGateway.handleMessage(
      {
        data: dummyMessage,
        timestamp: dummyDate,
      },
      socket,
    );

    expect(conversationService.sendMessage).not.toHaveBeenCalled();
  });

  it('should ask to redisService to save message', () => {
    socket.join(dummyMessage.conversationId);

    conversationGateway.handleMessage(
      {
        data: dummyMessage,
        timestamp: dummyDate,
      },
      socket,
    );

    expect(redisService.appendMessage).toHaveBeenCalledWith(dummyMessage);
  });
});
