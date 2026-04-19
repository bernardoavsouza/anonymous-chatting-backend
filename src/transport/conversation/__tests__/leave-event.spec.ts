import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/usecases/send-message.usecase';
import { ConversationEvent } from '@/transport/conversation/types';
import type { InputPort } from '@/transport/ports';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyDate, dummyUsers } from '~/dummies';
import { mockDate } from '~/globals/date';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation leave event', () => {
  let socket: Socket;
  let gateway: ConversationGateway;

  const leaveUseCaseMock = { execute: jest.fn() };

  beforeAll(() => {
    mockDate();
  });

  beforeEach(async () => {
    socket = MockedSocket();
    const app = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        { provide: LeaveConversationUseCase, useValue: leaveUseCaseMock },
        { provide: SendMessageUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();
    gateway = app.get(ConversationGateway);
  });

  it('should leave socket room', async () => {
    await gateway.handleLeave({ data: { userId: dummyUsers[0].id, conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(socket.leave).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should emit leave event to the conversation', async () => {
    await gateway.handleLeave({ data: { userId: dummyUsers[0].id, conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.to(dummyConversation.id).emit).toHaveBeenCalledWith(ConversationEvent.LEAVE, {
      data: { conversationId: dummyConversation.id, userId: dummyUsers[0].id },
      timestamp: dummyDate,
    } satisfies InputPort<{ conversationId: string; userId: string }>);
  });

  it('should call leave use case with data', async () => {
    await gateway.handleLeave({ data: { userId: dummyUsers[0].id, conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(leaveUseCaseMock.execute).toHaveBeenCalledWith({
      conversationId: dummyConversation.id,
      userId: dummyUsers[0].id,
    });
  });
});
