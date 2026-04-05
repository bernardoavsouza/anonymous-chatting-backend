import { ConversationEvent } from '@/transport/conversation/types';
import type { Socket } from 'socket.io';
import { dummyMessage } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { SendMessageUseCase } from '../send-message.usecase';

describe('SendMessageUseCase', () => {
  let useCase: SendMessageUseCase;
  let socket: Socket;

  beforeEach(() => {
    useCase = new SendMessageUseCase();
    socket = MockedSocket();
  });

  it('should emit message to the conversation', () => {
    useCase.execute({ socket, ...dummyMessage });

    expect(socket.to).toHaveBeenCalledWith(dummyMessage.conversationId);
    expect(socket.to(dummyMessage.conversationId).emit).toHaveBeenCalledWith(ConversationEvent.MESSAGE, {
      data: dummyMessage,
      timestamp: expect.any(Date),
    });
  });
});
