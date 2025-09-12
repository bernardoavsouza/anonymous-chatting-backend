import { ConversationService } from '@/application/conversation/service';
import { RedisService } from '@/application/redis/service';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyDate, dummyUser } from '~/dummies';
import { mockDate } from '~/globals/date';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation join event', () => {
  let socket: Socket;
  let conversationGateway: ConversationGateway;
  let service: ConversationService;

  const conversationServiceMock = {
    join: jest.fn(),
  };

  const redisServiceMock = {
    appendMessage: jest.fn(),
    appendDetails: jest.fn(),
  };

  beforeAll(() => {
    mockDate();
  });

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
    service = app.get<ConversationService>(ConversationService);
  });

  it('should trigger join method of conversation service properly', async () => {
    conversationGateway.handleJoin(
      {
        data: {
          userId: dummyUser.id,
          conversationId: dummyConversation.id,
        },
        timestamp: dummyDate,
      },
      socket,
    );

    expect(service.join).toHaveBeenCalledWith(socket, {
      conversationId: dummyConversation.id,
      userId: dummyUser.id,
    });
  });

  it('should save conversation details in redis', async () => {
    conversationGateway.handleJoin(
      {
        data: {
          userId: dummyUser.id,
          conversationId: dummyConversation.id,
        },
        timestamp: dummyDate,
      },
      socket,
    );

    expect(redisServiceMock.appendDetails).toHaveBeenCalledWith({
      conversationId: dummyConversation.id,
      userId: dummyUser.id,
    });
  });
});
