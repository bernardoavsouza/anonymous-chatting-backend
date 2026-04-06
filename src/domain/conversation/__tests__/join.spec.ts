import { RedisDatasource } from '@/datasource/redis/datasource';
import type { ConversationJoinInputDTO } from '@/transport/conversation/dto';
import { ConversationEvent } from '@/transport/conversation/types';
import type { InputPort } from '@/transport/ports';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyUsers } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { JoinConversationUseCase } from '../usecases/join.usecase';

describe('JoinConversationUseCase', () => {
  let useCase: JoinConversationUseCase;
  let socket: Socket;

  const redisMock = {
    upsertDetails: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    socket = MockedSocket();

    const app = await Test.createTestingModule({
      providers: [JoinConversationUseCase, { provide: RedisDatasource, useValue: redisMock }],
    }).compile();

    useCase = app.get(JoinConversationUseCase);
  });

  it('should join room', async () => {
    await useCase.execute({ socket, conversationId: dummyConversation.id, userId: dummyUsers[0].id });

    expect(socket.join).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should emit join event to the conversation', async () => {
    await useCase.execute({ socket, conversationId: dummyConversation.id, userId: dummyUsers[0].id });

    expect(socket.to).toHaveBeenCalledWith(dummyConversation.id);
    expect(socket.emit).toHaveBeenCalledWith(ConversationEvent.JOIN, {
      data: { conversationId: dummyConversation.id, userId: dummyUsers[0].id },
      timestamp: expect.any(Date),
    } satisfies InputPort<ConversationJoinInputDTO>);
  });

  it('should save conversation details in redis', async () => {
    await useCase.execute({ socket, conversationId: dummyConversation.id, userId: dummyUsers[0].id });

    expect(redisMock.upsertDetails).toHaveBeenCalledWith({ conversationId: dummyConversation.id, userId: dummyUsers[0].id });
  });
});
