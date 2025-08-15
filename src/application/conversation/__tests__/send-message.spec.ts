import { dummyMessage, MockedSocket } from '@/__mocks__/socket.io';
import { ConversationEvent } from '@/presentation/events/conversation/types';
import type { Socket } from 'socket.io';
import { ConversationService } from '../service';

describe('Conversation message service', () => {
  let service: ConversationService;
  let socket: Socket;

  beforeEach(() => {
    service = new ConversationService();
    socket = MockedSocket();
  });

  it('should emit message to the same room', () => {
    service.sendMessage(socket, dummyMessage);

    expect(socket.to).toHaveBeenCalledWith(dummyMessage.conversationId);
    expect(socket.to(dummyMessage.conversationId).emit).toHaveBeenCalledWith(
      ConversationEvent.MESSAGE,
      {
        data: dummyMessage,
        timestamp: expect.any(Date),
      },
    );
  });
});
