import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { ConversationEvent } from '@/transport/conversation/types';
import type { InputPort } from '@/transport/ports';
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
    socket.data = { userId: dummyUsers[0].id, conversationId: dummyConversation.id };

    const app = await Test.createTestingModule({
      providers: [DisconnectConversationUseCase, { provide: LeaveConversationUseCase, useValue: leaveUseCaseMock }],
    }).compile();

    useCase = app.get(DisconnectConversationUseCase);
  });

  it('should leave socket room', async () => {
    await useCase.execute(socket);

    expect(socket.leave).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should emit leave event to the conversation', async () => {
    await useCase.execute(socket);

    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.to(dummyConversation.id).emit).toHaveBeenCalledWith(ConversationEvent.LEAVE, {
      data: { conversationId: dummyConversation.id, userId: dummyUsers[0].id },
      timestamp: expect.any(Date),
    } satisfies InputPort<{ conversationId: string; userId: string }>);
  });

  it('should call leave use case with data from socket.data', async () => {
    await useCase.execute(socket);

    expect(leaveUseCaseMock.execute).toHaveBeenCalledWith({
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
