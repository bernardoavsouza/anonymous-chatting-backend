import { RedisDatasource } from '@/datasource/redis/datasource';
import { ConversationEvent } from '@/transport/conversation/types';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyUsers } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { LeaveConversationUseCase } from '../usecases/leave.usecase';

describe('LeaveConversationUseCase', () => {
  let useCase: LeaveConversationUseCase;
  let socket: Socket;

  const redisMock = {
    eraseConversation: jest.fn(),
    getDetails: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    socket = MockedSocket();

    const app = await Test.createTestingModule({
      providers: [LeaveConversationUseCase, { provide: RedisDatasource, useValue: redisMock }],
    }).compile();

    useCase = app.get(LeaveConversationUseCase);
  });

  it('should leave room', async () => {
    await useCase.execute({ socket, conversationId: dummyConversation.id, userId: dummyUsers[0].id });

    expect(socket.leave).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should emit leave event to the conversation', async () => {
    await useCase.execute({ socket, conversationId: dummyConversation.id, userId: dummyUsers[0].id });

    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.to(dummyConversation.id).emit).toHaveBeenCalledWith(ConversationEvent.LEAVE, {
      data: { conversationId: dummyConversation.id, userId: dummyUsers[0].id },
      timestamp: expect.any(Date),
    });
  });

  it('should erase conversation in redis on leave if you are the last user', async () => {
    redisMock.getDetails.mockResolvedValueOnce({ users: [dummyUsers[0].id] });

    await useCase.execute({ socket, conversationId: dummyConversation.id, userId: dummyUsers[0].id });

    expect(redisMock.eraseConversation).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should not erase conversation in redis on leave if you are not the last user', async () => {
    redisMock.getDetails.mockResolvedValueOnce({ users: [dummyUsers[0].id, dummyUsers[1].id] });

    await useCase.execute({ socket, conversationId: dummyConversation.id, userId: dummyUsers[1].id });

    expect(redisMock.eraseConversation).not.toHaveBeenCalled();
  });
});
