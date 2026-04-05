import { RedisDatasource } from '@/datasource/redis/datasource';
import { JoinConversationUseCase } from '@/domain/conversation/join.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/send-message.usecase';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyDate, dummyUsers } from '~/dummies';
import { mockDate } from '~/globals/date';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation join event', () => {
  let socket: Socket;
  let conversationGateway: ConversationGateway;

  const joinUseCaseMock = {
    execute: jest.fn(),
  };

  const redisServiceMock = {
    appendMessage: jest.fn().mockResolvedValue(undefined),
    upsertDetails: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(() => {
    mockDate();
  });

  beforeEach(async () => {
    socket = MockedSocket();
    const app = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        { provide: JoinConversationUseCase, useValue: joinUseCaseMock },
        { provide: LeaveConversationUseCase, useValue: { execute: jest.fn() } },
        { provide: SendMessageUseCase, useValue: { execute: jest.fn() } },
        { provide: RedisDatasource, useValue: redisServiceMock },
      ],
    }).compile();
    conversationGateway = app.get<ConversationGateway>(ConversationGateway);
  });

  it('should call join use case with socket and data', () => {
    conversationGateway.handleJoin({ data: { userId: dummyUsers[0].id, conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(joinUseCaseMock.execute).toHaveBeenCalledWith({
      socket,
      conversationId: dummyConversation.id,
      userId: dummyUsers[0].id,
    });
  });

  it('should save conversation details in redis', () => {
    conversationGateway.handleJoin({ data: { userId: dummyUsers[0].id, conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(redisServiceMock.upsertDetails).toHaveBeenCalledWith({
      conversationId: dummyConversation.id,
      userId: dummyUsers[0].id,
    });
  });
});
