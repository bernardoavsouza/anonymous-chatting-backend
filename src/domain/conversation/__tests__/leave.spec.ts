import { ConversationEvent } from '@/transport/conversation/types';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyUsers } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { LeaveConversationUseCase } from '../leave.usecase';

describe('LeaveConversationUseCase', () => {
  let useCase: LeaveConversationUseCase;
  let socket: Socket;

  beforeEach(() => {
    useCase = new LeaveConversationUseCase();
    socket = MockedSocket();
  });

  it('should leave room', () => {
    useCase.execute({ socket, conversationId: dummyConversation.id, userId: dummyUsers[0].id });

    expect(socket.leave).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should emit leave event to the conversation', () => {
    useCase.execute({ socket, conversationId: dummyConversation.id, userId: dummyUsers[0].id });

    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.to(dummyConversation.id).emit).toHaveBeenCalledWith(ConversationEvent.LEAVE, {
      data: { conversationId: dummyConversation.id, userId: dummyUsers[0].id },
      timestamp: expect.any(Date),
    });
  });
});
