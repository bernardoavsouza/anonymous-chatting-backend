import { RedisDatasource } from '@/datasource/redis/datasource';
import { JoinConversationUseCase } from '@/domain/conversation/join.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/send-message.usecase';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyDate, dummyMessage } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation message event', () => {
  let socket: Socket;
  let conversationGateway: ConversationGateway;

  const sendMessageUseCaseMock = {
    execute: jest.fn(),
  };

  const redisServiceMock = {
    appendMessage: jest.fn(),
  };

  beforeEach(async () => {
    socket = MockedSocket();
    const app = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        { provide: JoinConversationUseCase, useValue: { execute: jest.fn() } },
        { provide: LeaveConversationUseCase, useValue: { execute: jest.fn() } },
        { provide: SendMessageUseCase, useValue: sendMessageUseCaseMock },
        { provide: RedisDatasource, useValue: redisServiceMock },
      ],
    }).compile();
    conversationGateway = app.get<ConversationGateway>(ConversationGateway);
  });

  it('should call send message use case if client is in the room', async () => {
    socket.join(dummyMessage.conversationId);

    await conversationGateway.handleMessage({ data: dummyMessage, timestamp: dummyDate }, socket);

    expect(sendMessageUseCaseMock.execute).toHaveBeenCalledWith({ socket, ...dummyMessage });
  });

  it('should not call send message use case if client is not in the room', async () => {
    await conversationGateway.handleMessage({ data: dummyMessage, timestamp: dummyDate }, socket);

    expect(sendMessageUseCaseMock.execute).not.toHaveBeenCalled();
  });

  it('should save message in redis', async () => {
    socket.join(dummyMessage.conversationId);

    await conversationGateway.handleMessage({ data: dummyMessage, timestamp: dummyDate }, socket);

    expect(redisServiceMock.appendMessage).toHaveBeenCalledWith(dummyMessage);
  });
});
