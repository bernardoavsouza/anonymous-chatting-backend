import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyUsers } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { DisconnectConversationUseCase } from '../usecases/disconnect.usecase';

describe('DisconnectConversationUseCase', () => {
  let useCase: DisconnectConversationUseCase;
  let socket: Socket;

  const leaveUseCaseMock = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    socket = MockedSocket();

    const app = await Test.createTestingModule({
      providers: [DisconnectConversationUseCase, { provide: LeaveConversationUseCase, useValue: leaveUseCaseMock }],
    }).compile();

    useCase = app.get(DisconnectConversationUseCase);
  });

  it('should call leave use case with socket and data from socket.data', async () => {
    socket.data = { userId: dummyUsers[0].id, conversationId: dummyConversation.id };

    await useCase.execute(socket);

    expect(leaveUseCaseMock.execute).toHaveBeenCalledWith({
      socket,
      userId: dummyUsers[0].id,
      conversationId: dummyConversation.id,
    });
  });

  it('should do nothing if socket has no user data', async () => {
    socket.data = {};

    await useCase.execute(socket);

    expect(leaveUseCaseMock.execute).not.toHaveBeenCalled();
  });
});
