import { ConversationEvent } from '@/transport/conversation/types';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyUsers } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { ConversationService } from '../service';

describe('Conversation leave service', () => {
  let service: ConversationService;
  let socket: Socket;

  beforeEach(() => {
    service = new ConversationService();
    socket = MockedSocket();
  });

  it('should leave room on conversation leave event', () => {
    service.leave(socket, {
      conversationId: dummyConversation.id,
      userId: dummyUsers[0].id,
    });

    expect(socket.leave).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should emit conversation leave event to the same conversation', () => {
    service.leave(socket, {
      conversationId: dummyConversation.id,
      userId: dummyUsers[0].id,
    });

    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.to(dummyConversation.id).emit).toHaveBeenCalledWith(ConversationEvent.LEAVE, {
      data: {
        conversationId: dummyConversation.id,
        userId: dummyUsers[0].id,
      },
      timestamp: expect.any(Date),
    });
  });
});
