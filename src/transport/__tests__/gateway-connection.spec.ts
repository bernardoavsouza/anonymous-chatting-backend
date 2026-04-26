import { ConnectConversationUseCase } from '@/domain/conversation/usecases/connect.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { AppGateway } from '@/transport/app.gateway';
import { ConversationEvent } from '@/transport/conversation/types';
import { ErrorCode } from '@/transport/errors/codes';
import { ConversationError } from '@/transport/errors/conversation.error';
import type { InputPort } from '@/transport/ports';
import type { AppSocket, ConnectedInConversationDTO } from '@/transport/types';
import { Test } from '@nestjs/testing';
import { dummyConversation, dummyUsers } from '~/dummies';
import { MockedSocket } from '~/socket.io';

describe('AppGateway (handleConnection)', () => {
  let socket: AppSocket;
  let gateway: AppGateway;

  const connectUseCaseMock = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    connectUseCaseMock.execute.mockResolvedValue({ userId: dummyUsers[0].id, conversationId: dummyConversation.id });
    socket = MockedSocket();

    const app = await Test.createTestingModule({
      providers: [
        AppGateway,
        { provide: ConnectConversationUseCase, useValue: connectUseCaseMock },
        { provide: LeaveConversationUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    gateway = app.get(AppGateway);
  });

  it('should call the use case with no conversationId when not provided', async () => {
    socket.handshake.auth = { nickname: dummyUsers[0].nickname };

    await gateway.handleConnection(socket);

    expect(connectUseCaseMock.execute).toHaveBeenCalledWith({ conversationId: undefined, nickname: dummyUsers[0].nickname });
  });

  it('should call the use case with conversationId when provided', async () => {
    socket.handshake.auth = { nickname: dummyUsers[0].nickname, conversationId: dummyConversation.id };

    await gateway.handleConnection(socket);

    expect(connectUseCaseMock.execute).toHaveBeenCalledWith({ conversationId: dummyConversation.id, nickname: dummyUsers[0].nickname });
  });

  it('should store userId, nickname and conversationId in socket.data', async () => {
    socket.handshake.auth = { nickname: dummyUsers[0].nickname, conversationId: dummyConversation.id };

    await gateway.handleConnection(socket);

    expect(socket.data).toEqual({ userId: dummyUsers[0].id, nickname: dummyUsers[0].nickname, conversationId: dummyConversation.id });
  });

  it('should emit join event with nickname and conversationId', async () => {
    socket.handshake.auth = { nickname: dummyUsers[0].nickname, conversationId: dummyConversation.id };

    await gateway.handleConnection(socket);

    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.to(dummyConversation.id).emit).toHaveBeenCalledWith(ConversationEvent.JOIN, {
      data: { nickname: dummyUsers[0].nickname, conversationId: dummyConversation.id },
      timestamp: expect.any(Date),
    } satisfies InputPort<ConnectedInConversationDTO>);
  });

  it('should emit INVALID_AUTH error and disconnect when nickname is missing', async () => {
    socket.handshake.auth = {} as AppSocket['handshake']['auth'];

    await gateway.handleConnection(socket);

    expect(socket.emit).toHaveBeenCalledWith('error', { code: ErrorCode.INVALID_AUTH, message: expect.any(String) });
    expect(socket.disconnect).toHaveBeenCalled();
  });

  it('should emit INVALID_AUTH error and disconnect when nickname is empty string', async () => {
    socket.handshake.auth = { nickname: '' };

    await gateway.handleConnection(socket);

    expect(socket.emit).toHaveBeenCalledWith('error', { code: ErrorCode.INVALID_AUTH, message: expect.any(String) });
    expect(socket.disconnect).toHaveBeenCalled();
  });

  it('should not call ConnectConversationUseCase when nickname is missing', async () => {
    socket.handshake.auth = {} as AppSocket['handshake']['auth'];

    await gateway.handleConnection(socket);

    expect(connectUseCaseMock.execute).not.toHaveBeenCalled();
  });

  it('should disconnect when use case throws ConversationError and emit the ConversationError', async () => {
    socket.handshake.auth = { nickname: dummyUsers[0].nickname };
    connectUseCaseMock.execute.mockRejectedValueOnce(new ConversationError(ErrorCode.INVALID_AUTH, 'random conversation error'));

    await gateway.handleConnection(socket);

    expect(socket.emit).toHaveBeenCalledWith('error', { code: ErrorCode.INVALID_AUTH, message: 'random conversation error' });
    expect(socket.disconnect).toHaveBeenCalled();
  });

  it('should emit INTERNAL_ERROR and disconnect when use case throws unexpected error', async () => {
    socket.handshake.auth = { nickname: dummyUsers[0].nickname };
    connectUseCaseMock.execute.mockRejectedValueOnce(new Error('unexpected'));

    await gateway.handleConnection(socket);

    expect(socket.emit).toHaveBeenCalledWith('error', { code: ErrorCode.INTERNAL_ERROR, message: 'Internal Server Error' });
    expect(socket.disconnect).toHaveBeenCalled();
  });
});
