import { JoinConversationUseCase } from '@/domain/conversation/usecases/join.usecase';
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

  it('should join socket to the room', async () => {
    await gateway.handleJoin({ data: { userId: dummyUsers[0].id, conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(socket.join).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should emit join event to the conversation', async () => {
    await gateway.handleJoin({ data: { userId: dummyUsers[0].id, conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.to(dummyConversation.id).emit).toHaveBeenCalledWith(ConversationEvent.JOIN, {
      data: { userId: dummyUsers[0].id, conversationId: dummyConversation.id },
      timestamp: dummyDate,
    } satisfies InputPort<{ userId: string; conversationId: string }>);
  });

  it('should call join use case with data', async () => {
    await gateway.handleJoin({ data: { userId: dummyUsers[0].id, conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(joinUseCaseMock.execute).toHaveBeenCalledWith({
      conversationId: dummyConversation.id,
      userId: dummyUsers[0].id,
    });
  });
});
