import { RedisDatasource } from '@/datasource/redis/datasource';
import { ConversationEvent } from '@/transport/conversation/types';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyMessage } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { SendMessageUseCase } from '../usecases/send-message.usecase';

describe('SendMessageUseCase', () => {
  let useCase: SendMessageUseCase;
  let socket: Socket;

  const redisMock = {
    appendMessage: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    socket = MockedSocket();

    const app = await Test.createTestingModule({
      providers: [SendMessageUseCase, { provide: RedisDatasource, useValue: redisMock }],
    }).compile();

    useCase = app.get(SendMessageUseCase);
  });

  it('should emit message to the conversation', async () => {
    await useCase.execute({ socket, ...dummyMessage });

    expect(socket.to).toHaveBeenCalledWith(dummyMessage.conversationId);
    expect(socket.to(dummyMessage.conversationId).emit).toHaveBeenCalledWith(ConversationEvent.MESSAGE, {
      data: dummyMessage,
      timestamp: expect.any(Date),
    });
  });

  it('should save message in redis', async () => {
    await useCase.execute({ socket, ...dummyMessage });

    expect(redisMock.appendMessage).toHaveBeenCalledWith(dummyMessage);
  });
});
