import type { ConversationJoinInputDTO } from '@/presentation/events/conversation/dto';
import { ConversationEvent } from '@/presentation/events/conversation/types';
import type { InputPort } from '@/presentation/ports';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyUser } from '~/dummies';
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
      userId: dummyUser.id,
    });

    expect(socket.join).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should emit conversation join event to the same conversation', () => {
    service.join(socket, {
      conversationId: dummyConversation.id,
      userId: dummyUser.id,
    });

    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.emit).toHaveBeenCalledWith(ConversationEvent.JOIN, {
      data: {
        conversationId: dummyConversation.id,
        userId: dummyUser.id,
      },
      timestamp: expect.any(Date),
    } satisfies InputPort<ConversationJoinInputDTO>);
  });
});
