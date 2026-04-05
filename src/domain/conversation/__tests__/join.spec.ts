import type { ConversationJoinInputDTO } from '@/transport/conversation/dto';
import { ConversationEvent } from '@/transport/conversation/types';
import type { InputPort } from '@/transport/ports';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyUsers } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { ConversationService } from '../service';

describe('Conversation join service', () => {
  let service: ConversationService;
  let socket: Socket;

  beforeEach(() => {
    service = new ConversationService();
    socket = MockedSocket();
  });

  it('should join room on conversation join event', () => {
    service.join(socket, {
      conversationId: dummyConversation.id,
      userId: dummyUsers[0].id,
    });

    expect(socket.join).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should emit conversation join event to the same conversation', () => {
    service.join(socket, {
      conversationId: dummyConversation.id,
      userId: dummyUsers[0].id,
    });

    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.emit).toHaveBeenCalledWith(ConversationEvent.JOIN, {
      data: {
        conversationId: dummyConversation.id,
        userId: dummyUsers[0].id,
      },
      timestamp: expect.any(Date),
    } satisfies InputPort<ConversationJoinInputDTO>);
  });
});
