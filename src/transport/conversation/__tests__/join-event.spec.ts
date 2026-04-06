import { JoinConversationUseCase } from '@/domain/conversation/usecases/join.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/usecases/send-message.usecase';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyDate, dummyUsers } from '~/dummies';
import { mockDate } from '~/globals/date';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation join event', () => {
  let socket: Socket;
  let gateway: ConversationGateway;

  const joinUseCaseMock = { execute: jest.fn() };

  beforeAll(() => {
    mockDate();
  });

  beforeEach(async () => {
    socket = MockedSocket();
    const app = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        { provide: JoinConversationUseCase, useValue: joinUseCaseMock },
        { provide: LeaveConversationUseCase, useValue: { execute: jest.fn() } },
        { provide: SendMessageUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();
    gateway = app.get(ConversationGateway);
  });

  it('should call join use case with socket and data', () => {
    gateway.handleJoin({ data: { userId: dummyUsers[0].id, conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(joinUseCaseMock.execute).toHaveBeenCalledWith({
      socket,
      conversationId: dummyConversation.id,
      userId: dummyUsers[0].id,
    });
  });
});
