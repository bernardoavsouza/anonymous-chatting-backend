import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/usecases/send-message.usecase';
import { ConversationEvent } from '@/transport/conversation/types';
import { ErrorCode } from '@/transport/errors/codes';
import { ConversationError } from '@/transport/errors/conversation.error';
import type { InputPort } from '@/transport/ports';
import type { AppSocket } from '@/transport/types';
import { Test } from '@nestjs/testing';
import { dummyDate, dummyMessage } from '~/dummies';
import { mockDate } from '~/globals/date';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation message event', () => {
  let socket: AppSocket;
  let gateway: ConversationGateway;

  const sendMessageUseCaseMock = { execute: jest.fn() };

  beforeAll(() => {
    mockDate();
  });

  beforeEach(async () => {
    socket = MockedSocket();
    const app = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        { provide: LeaveConversationUseCase, useValue: { execute: jest.fn() } },
        { provide: SendMessageUseCase, useValue: sendMessageUseCaseMock },
      ],
    }).compile();
    gateway = app.get(ConversationGateway);
  });

  it('should emit message event to the conversation', async () => {
    socket.join(dummyMessage.conversationId);

    await gateway.handleMessage({ data: dummyMessage, timestamp: dummyDate }, socket);

    expect(socket.to).toHaveBeenCalledWith(dummyMessage.conversationId);
    expect(socket.to(dummyMessage.conversationId).emit).toHaveBeenCalledWith(ConversationEvent.MESSAGE, {
      data: dummyMessage,
      timestamp: dummyDate,
    } satisfies InputPort<typeof dummyMessage>);
  });

  it('should call send message use case with data', async () => {
    socket.join(dummyMessage.conversationId);

    await gateway.handleMessage({ data: dummyMessage, timestamp: dummyDate }, socket);

    expect(sendMessageUseCaseMock.execute).toHaveBeenCalledWith(dummyMessage);
  });

  it('should not call send message use case if client is not in the room', async () => {
    await gateway.handleMessage({ data: dummyMessage, timestamp: dummyDate }, socket);

    expect(sendMessageUseCaseMock.execute).not.toHaveBeenCalled();
  });

  it('should emit NOT_IN_ROOM error when client is not in the room', async () => {
    await gateway.handleMessage({ data: dummyMessage, timestamp: dummyDate }, socket);

    expect(socket.emit).toHaveBeenCalledWith('error', { code: ErrorCode.NOT_IN_ROOM, message: expect.any(String) });
  });

  it('should emit INTERNAL_ERROR when use case throws ConversationError', async () => {
    socket.join(dummyMessage.conversationId);
    sendMessageUseCaseMock.execute.mockRejectedValueOnce(new ConversationError(ErrorCode.INTERNAL_ERROR, 'redis down'));

    await gateway.handleMessage({ data: dummyMessage, timestamp: dummyDate }, socket);

    expect(socket.emit).toHaveBeenCalledWith('error', { code: ErrorCode.INTERNAL_ERROR, message: 'redis down' });
  });

  it('should emit INTERNAL_ERROR when use case throws unexpected error', async () => {
    socket.join(dummyMessage.conversationId);
    sendMessageUseCaseMock.execute.mockRejectedValueOnce(new Error('unexpected'));

    await gateway.handleMessage({ data: dummyMessage, timestamp: dummyDate }, socket);

    expect(socket.emit).toHaveBeenCalledWith('error', { code: ErrorCode.INTERNAL_ERROR, message: 'Internal Server Error' });
  });
});
