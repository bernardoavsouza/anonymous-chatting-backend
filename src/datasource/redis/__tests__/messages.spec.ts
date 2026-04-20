import type { ConversationDetails, Message } from '@/domain/conversation/interfaces';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { dummyConversation, dummyDate, dummyMessage, dummyUsers } from '~/dummies';
import { mockDate } from '~/globals/date';
import { RedisDatasource } from '../datasource';

describe('Redis messages service', () => {
  let redisService: RedisDatasource;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [
        RedisDatasource,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    redisService = app.get<RedisDatasource>(RedisDatasource);
    mockDate();
  });

  it('should be able to append new messages', async () => {
    await redisService.appendMessage(dummyMessage);

    expect(redisService.client.rpush).toHaveBeenCalledWith(
      dummyMessage.conversationId,
      JSON.stringify({
        content: dummyMessage.content,
        nickname: dummyMessage.nickname,
        createdAt: dummyDate,
      } satisfies Omit<Message, 'conversationId'>),
    );
  });

  it('should be able to create conversation details', async () => {
    await redisService.upsertDetails({
      conversationId: dummyConversation.id,
      nickname: dummyUsers[0].nickname,
    });

    expect(redisService.client.set).toHaveBeenCalledWith(
      `details-${dummyConversation.id}`,
      JSON.stringify({
        conversationId: dummyConversation.id,
        users: [dummyUsers[0].nickname],
        createdAt: dummyDate,
      } satisfies ConversationDetails),
    );
  });

  it('should be able to add new users to conversation details', async () => {
    await redisService.upsertDetails({
      conversationId: dummyConversation.id,
      nickname: dummyUsers[0].nickname,
    });

    await redisService.upsertDetails({
      conversationId: dummyConversation.id,
      nickname: dummyUsers[1].nickname,
    });

    const redisSetter = redisService.client.set as jest.Mock;

    expect(redisSetter.mock.calls.pop()).toEqual([
      `details-${dummyConversation.id}`,
      JSON.stringify({
        conversationId: dummyConversation.id,
        users: [dummyUsers[0].nickname, dummyUsers[1].nickname],
        createdAt: dummyDate,
      } satisfies ConversationDetails),
    ]);
  });
});
