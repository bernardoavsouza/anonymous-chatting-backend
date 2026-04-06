import { ConnectConversationUseCase } from '@/domain/conversation/usecases/connect.usecase';
import { DisconnectConversationUseCase } from '@/domain/conversation/usecases/disconnect.usecase';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyUsers } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { AppGateway } from '../app.gateway';

describe('AppGateway (handleConnection)', () => {
  let socket: Socket;
  let gateway: AppGateway;

  const connectUseCaseMock = { execute: jest.fn() };
  const disconnectUseCaseMock = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    socket = MockedSocket();

    const app = await Test.createTestingModule({
      providers: [
        AppGateway,
        { provide: ConnectConversationUseCase, useValue: connectUseCaseMock },
        { provide: DisconnectConversationUseCase, useValue: disconnectUseCaseMock },
      ],
    }).compile();

    gateway = app.get(AppGateway);
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

  it('should store userId and conversationId in socket.data', async () => {
    socket.handshake.auth = { nickname: dummyUsers[0].nickname };
    connectUseCaseMock.execute.mockResolvedValueOnce({ userId: dummyUsers[0].id, conversationId: dummyConversation.id });

    await gateway.handleConnection(socket);

    expect(socket.data).toEqual({ userId: dummyUsers[0].id, conversationId: dummyConversation.id });
  });
});

describe('AppGateway (handleDisconnect)', () => {
  let socket: Socket;
  let gateway: AppGateway;

  const disconnectUseCaseMock = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    socket = MockedSocket();

    const app = await Test.createTestingModule({
      providers: [
        AppGateway,
        { provide: ConnectConversationUseCase, useValue: { execute: jest.fn() } },
        { provide: DisconnectConversationUseCase, useValue: disconnectUseCaseMock },
      ],
    }).compile();

    gateway = app.get(AppGateway);
  });

  it('should call disconnect use case with socket', async () => {
    await gateway.handleDisconnect(socket);

    expect(disconnectUseCaseMock.execute).toHaveBeenCalledWith(socket);
  });
});
