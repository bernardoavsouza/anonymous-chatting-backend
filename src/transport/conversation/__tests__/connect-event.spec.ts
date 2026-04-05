import { RedisDatasource } from '@/datasource/redis/datasource';
import { ConnectConversationUseCase } from '@/domain/conversation/connect.usecase';
import { ConversationService } from '@/domain/conversation/service';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyUsers } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation connect event (handleConnection)', () => {
  let socket: Socket;
  let gateway: ConversationGateway;

  const connectUseCaseMock = {
    execute: jest.fn(),
  };

  const conversationServiceMock = {
    join: jest.fn(),
    leave: jest.fn(),
    sendMessage: jest.fn(),
  };

  const redisServiceMock = {
    upsertDetails: jest.fn(),
    appendMessage: jest.fn(),
    eraseConversation: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    socket = MockedSocket();

    const app = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        { provide: ConnectConversationUseCase, useValue: connectUseCaseMock },
        { provide: ConversationService, useValue: conversationServiceMock },
        { provide: RedisDatasource, useValue: redisServiceMock },
      ],
    }).compile();

    gateway = app.get(ConversationGateway);
  });

  it('should call the use case with nickname and no conversationId when not provided', async () => {
    socket.handshake.auth = { nickname: dummyUsers[0].nickname };
    connectUseCaseMock.execute.mockResolvedValueOnce({ userId: dummyUsers[0].id, conversationId: dummyConversation.id });

    await gateway.handleConnection(socket);

    expect(connectUseCaseMock.execute).toHaveBeenCalledWith({ nickname: dummyUsers[0].nickname, conversationId: undefined });
  });

  it('should call the use case with nickname and conversationId when provided', async () => {
    socket.handshake.auth = { nickname: dummyUsers[0].nickname, conversationId: dummyConversation.id };
    connectUseCaseMock.execute.mockResolvedValueOnce({ userId: dummyUsers[0].id, conversationId: dummyConversation.id });

    await gateway.handleConnection(socket);

    expect(connectUseCaseMock.execute).toHaveBeenCalledWith({ nickname: dummyUsers[0].nickname, conversationId: dummyConversation.id });
  });

  // it('should emit connected event with the use case result', async () => {
  //   socket.handshake.auth = { nickname: dummyUsers[0].nickname };
  //   const result = { userId: dummyUsers[0].id, conversationId: dummyConversation.id };
  //   connectUseCaseMock.execute.mockResolvedValueOnce(result);

  //   await gateway.handleConnection(socket);

  //   expect(socket.emit).toHaveBeenCalledWith('connected', result);
  // });
});
