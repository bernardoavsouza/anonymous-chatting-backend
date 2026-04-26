import { ConnectConversationUseCase } from '@/domain/conversation/usecases/connect.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { ConversationEvent } from '@/transport/conversation/types';
import type { InputPort } from '@/transport/ports';
import type { AppSocket } from '@/transport/types';
import { Test } from '@nestjs/testing';
import { dummyConversation, dummyUsers } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { AppGateway } from '../app.gateway';

describe('AppGateway (handleDisconnect)', () => {
  let socket: AppSocket;
  let gateway: AppGateway;

  const leaveUseCaseMock = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    socket = MockedSocket();
    socket.data = { userId: dummyUsers[0].id, nickname: dummyUsers[0].nickname, conversationId: dummyConversation.id };

    const app = await Test.createTestingModule({
      providers: [
        AppGateway,
        { provide: ConnectConversationUseCase, useValue: { execute: jest.fn() } },
        { provide: LeaveConversationUseCase, useValue: leaveUseCaseMock },
      ],
    }).compile();

    gateway = app.get(AppGateway);
  });

  it('should leave socket room', async () => {
    await gateway.handleDisconnect(socket);

    expect(socket.leave).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should emit leave event to the conversation', async () => {
    await gateway.handleDisconnect(socket);

    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.to(dummyConversation.id).emit).toHaveBeenCalledWith(ConversationEvent.LEAVE, {
      data: { nickname: dummyUsers[0].nickname, conversationId: dummyConversation.id },
      timestamp: expect.any(Date),
    } satisfies InputPort<{ nickname: string; conversationId: string }>);
  });

  it('should call leave use case with data from socket.data', async () => {
    await gateway.handleDisconnect(socket);

    expect(leaveUseCaseMock.execute).toHaveBeenCalledWith({
      nickname: dummyUsers[0].nickname,
      conversationId: dummyConversation.id,
    });
  });

  it('should do nothing if socket has no user data', async () => {
    socket.data = {};

    await gateway.handleDisconnect(socket);

    expect(leaveUseCaseMock.execute).not.toHaveBeenCalled();
  });

  it('should resolve without throwing when use case rejects', async () => {
    leaveUseCaseMock.execute.mockRejectedValueOnce(new Error('redis down'));

    await expect(gateway.handleDisconnect(socket)).resolves.toBeUndefined();
  });

  it('should not emit error event when use case rejects during disconnect', async () => {
    leaveUseCaseMock.execute.mockRejectedValueOnce(new Error('redis down'));

    await gateway.handleDisconnect(socket);

    expect(socket.emit).not.toHaveBeenCalledWith('error', expect.anything());
  });
});
