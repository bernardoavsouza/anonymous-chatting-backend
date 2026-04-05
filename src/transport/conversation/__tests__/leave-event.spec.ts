import { RedisDatasource } from '@/datasource/redis/datasource';
import { JoinConversationUseCase } from '@/domain/conversation/join.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/send-message.usecase';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyConversation, dummyDate, dummyIds, dummyUsers } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation leave event', () => {
  let socket: Socket;
  let conversationGateway: ConversationGateway;

  const leaveUseCaseMock = {
    execute: jest.fn(),
  };

  const redisServiceMock = {
    eraseConversation: jest.fn(),
  };

  beforeEach(async () => {
    socket = MockedSocket();
    const app = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        { provide: JoinConversationUseCase, useValue: { execute: jest.fn() } },
        { provide: LeaveConversationUseCase, useValue: leaveUseCaseMock },
        { provide: SendMessageUseCase, useValue: { execute: jest.fn() } },
        { provide: RedisDatasource, useValue: redisServiceMock },
      ],
    }).compile();
    conversationGateway = app.get<ConversationGateway>(ConversationGateway);
  });

  it('should call leave use case with socket and data', () => {
    conversationGateway.handleLeave({ data: { userId: dummyUsers[0].id, conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(leaveUseCaseMock.execute).toHaveBeenCalledWith({
      socket,
      conversationId: dummyConversation.id,
      userId: dummyUsers[0].id,
    });
  });

  it('should erase conversation in redis when room is empty', () => {
    conversationGateway.handleLeave({ data: { userId: dummyUsers[0].id, conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(redisServiceMock.eraseConversation).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should not erase conversation when room still has members', () => {
    socket.join(dummyIds[0] as string);
    socket.join(dummyIds[1] as string);

    conversationGateway.handleLeave({ data: { userId: dummyUsers[0].id, conversationId: dummyConversation.id }, timestamp: dummyDate }, socket);

    expect(redisServiceMock.eraseConversation).not.toHaveBeenCalled();
  });
});
