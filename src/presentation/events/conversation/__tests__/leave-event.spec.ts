import { ConversationService } from '@/application/conversation/service';
import { RedisService } from '@/application/redis/service';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyDate, dummyIds, dummyUser } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation leave event', () => {
  let socket: Socket;
  let conversationGateway: ConversationGateway;
  let service: ConversationService;

  const conversationServiceMock = {
    leave: jest.fn(),
  };

  const redisServiceMock = {
    eraseConversation: jest.fn(),
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

  it('should ask redisService to erase conversation if there is no one left', () => {
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

    expect(redisServiceMock.eraseConversation).toHaveBeenCalledWith(
      dummyConversation.id,
    );
  });

  it("shouldn't ask redisService to erase conversation if there is someone left", () => {
    socket.join(dummyIds[0] as string);
    socket.join(dummyIds[1] as string);

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

    expect(redisServiceMock.eraseConversation).not.toHaveBeenCalled();
  });
});
