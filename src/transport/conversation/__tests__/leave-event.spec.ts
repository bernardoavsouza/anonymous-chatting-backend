import { JoinConversationUseCase } from '@/domain/conversation/usecases/join.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/usecases/send-message.usecase';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyDate, dummyUsers } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation leave event', () => {
  let socket: Socket;
  let gateway: ConversationGateway;

  const leaveUseCaseMock = { execute: jest.fn() };

  beforeEach(async () => {
    socket = MockedSocket();
    const app = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        { provide: JoinConversationUseCase, useValue: { execute: jest.fn() } },
        { provide: LeaveConversationUseCase, useValue: leaveUseCaseMock },
        { provide: SendMessageUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();
    gateway = app.get(ConversationGateway);
  });

  it('should call leave use case with socket and data', async () => {
    await gateway.handleLeave({ data: { userId: dummyUsers[0].id, conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(leaveUseCaseMock.execute).toHaveBeenCalledWith({
      socket,
      conversationId: dummyConversation.id,
      userId: dummyUsers[0].id,
    });
  });
});
