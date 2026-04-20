import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/usecases/send-message.usecase';
import type { ConversationLeaveInputDTO } from '@/transport/conversation/dto';
import { ConversationEvent } from '@/transport/conversation/types';
import type { InputPort } from '@/transport/ports';
import type { AppSocket } from '@/transport/types';
import { Test } from '@nestjs/testing';
import { dummyConversation, dummyDate, dummyUsers } from '~/dummies';
import { mockDate } from '~/globals/date';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation leave event', () => {
  let socket: AppSocket;
  let gateway: ConversationGateway;

  const leaveUseCaseMock = { execute: jest.fn() };

  beforeAll(() => {
    mockDate();
  });

  beforeEach(async () => {
    socket = MockedSocket();
    socket.data = { nickname: dummyUsers[0].nickname, conversationId: dummyConversation.id };
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
    await gateway.handleLeave({ data: { conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(socket.leave).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should emit leave event to the conversation', async () => {
    await gateway.handleLeave({ data: { conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.to(dummyConversation.id).emit).toHaveBeenCalledWith(ConversationEvent.LEAVE, {
      data: { conversationId: dummyConversation.id },
      timestamp: dummyDate,
    } satisfies InputPort<ConversationLeaveInputDTO>);
  });

  it('should call leave use case with data from socket.data', async () => {
    await gateway.handleLeave({ data: { conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(leaveUseCaseMock.execute).toHaveBeenCalledWith({
      nickname: dummyUsers[0].nickname,
      conversationId: dummyConversation.id,
    });
  });
});
