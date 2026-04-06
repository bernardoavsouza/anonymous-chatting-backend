import { JoinConversationUseCase } from '@/domain/conversation/usecases/join.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/usecases/send-message.usecase';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyDate, dummyMessage } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation message event', () => {
  let socket: Socket;
  let gateway: ConversationGateway;

  const sendMessageUseCaseMock = { execute: jest.fn() };

  beforeEach(async () => {
    socket = MockedSocket();
    const app = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        { provide: JoinConversationUseCase, useValue: { execute: jest.fn() } },
        { provide: LeaveConversationUseCase, useValue: { execute: jest.fn() } },
        { provide: SendMessageUseCase, useValue: sendMessageUseCaseMock },
      ],
    }).compile();
    gateway = app.get(ConversationGateway);
  });

  it('should call send message use case if client is in the room', async () => {
    socket.join(dummyMessage.conversationId);

    await gateway.handleMessage({ data: dummyMessage, timestamp: dummyDate }, socket);

    expect(sendMessageUseCaseMock.execute).toHaveBeenCalledWith({ socket, ...dummyMessage });
  });

  it('should not call send message use case if client is not in the room', async () => {
    await gateway.handleMessage({ data: dummyMessage, timestamp: dummyDate }, socket);

    expect(sendMessageUseCaseMock.execute).not.toHaveBeenCalled();
  });
});
