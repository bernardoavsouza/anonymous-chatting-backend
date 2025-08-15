import {
  dummyConversation,
  dummyUser,
  MockedSocket,
} from '@/__mocks__/socket.io';
import type { InputPort } from '@/core/ports.interfaces';
import type { ConversationJoinInputDTO } from '@/infra/events/conversation/dto';
import { ConversationEvent } from '@/infra/events/conversation/types';
import type { Socket } from 'socket.io';
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
      user: dummyUser,
    });

    expect(socket.join).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should emit conversation join event to the same conversation', () => {
    service.join(socket, {
      conversationId: dummyConversation.id,
      user: dummyUser,
    });

    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.emit).toHaveBeenCalledWith(ConversationEvent.JOIN, {
      data: {
        conversationId: dummyConversation.id,
        user: dummyUser,
      },
      timestamp: expect.any(Date),
    } satisfies InputPort<ConversationJoinInputDTO>);
  });
});
