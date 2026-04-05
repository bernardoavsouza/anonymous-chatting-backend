import { RedisDatasource } from '@/datasource/redis/datasource';
import { ConnectConversationUseCase } from '@/domain/conversation/connect.usecase';
import { ConversationService } from '@/domain/conversation/service';
import { Test } from '@nestjs/testing';
import type { Socket } from 'socket.io';
import { dummyDate, dummyMessage } from '~/dummies';
import { MockedSocket } from '~/socket.io';
import { ConversationGateway } from '../gateway';

describe('Conversation message event', () => {
  let socket: Socket;
  let conversationGateway: ConversationGateway;
  let conversationService: ConversationService;
  let redisService: RedisDatasource;

  const conversationServiceMock = {
    sendMessage: jest.fn(),
  };

  const redisServiceMock = {
    appendMessage: jest.fn(),
  };

  const connectUseCaseMock = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    socket = MockedSocket();
    const app = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        {
          provide: ConversationService,
          useValue: conversationServiceMock,
        },
        {
          provide: RedisDatasource,
          useValue: redisServiceMock,
        },
        {
          provide: ConnectConversationUseCase,
          useValue: connectUseCaseMock,
        },
      ],
    }).compile();
    conversationGateway = app.get<ConversationGateway>(ConversationGateway);
    conversationService = app.get<ConversationService>(ConversationService);
    redisService = app.get<RedisDatasource>(RedisDatasource);
  });

  it('should call conversation send message conversationService if conversation is found', () => {
    socket.join(dummyMessage.conversationId);

    conversationGateway.handleMessage(
      {
        data: dummyMessage,
        timestamp: dummyDate,
      },
      socket,
    );

    expect(conversationService.sendMessage).toHaveBeenCalledWith(socket, dummyMessage);
  });

  it('should not call conversation send message conversationService if conversation is not found', () => {
    conversationGateway.handleMessage(
      {
        data: dummyMessage,
        timestamp: dummyDate,
      },
      socket,
    );

    expect(conversationService.sendMessage).not.toHaveBeenCalled();
  });

  it('should ask to redisService to save message', () => {
    socket.join(dummyMessage.conversationId);

    conversationGateway.handleMessage(
      {
        data: dummyMessage,
        timestamp: dummyDate,
      },
      socket,
    );

    expect(redisService.appendMessage).toHaveBeenCalledWith(dummyMessage);
  });
});
