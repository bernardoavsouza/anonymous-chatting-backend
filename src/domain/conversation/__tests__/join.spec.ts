import type { ConversationJoinInputDTO } from '@/transport/conversation/dto';
import { ConversationEvent } from '@/transport/conversation/types';
import type { InputPort } from '@/transport/ports';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyUsers } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { JoinConversationUseCase } from '../usecases/join.usecase';

describe('JoinConversationUseCase', () => {
  let useCase: JoinConversationUseCase;
  let socket: Socket;

  beforeEach(() => {
    useCase = new JoinConversationUseCase();
    socket = MockedSocket();
  });

  it('should join room', () => {
    useCase.execute({ socket, conversationId: dummyConversation.id, userId: dummyUsers[0].id });

    expect(socket.join).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should emit join event to the conversation', () => {
    useCase.execute({ socket, conversationId: dummyConversation.id, userId: dummyUsers[0].id });

    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.emit).toHaveBeenCalledWith(ConversationEvent.JOIN, {
      data: { conversationId: dummyConversation.id, userId: dummyUsers[0].id },
      timestamp: expect.any(Date),
    } satisfies InputPort<ConversationJoinInputDTO>);
  });
});
