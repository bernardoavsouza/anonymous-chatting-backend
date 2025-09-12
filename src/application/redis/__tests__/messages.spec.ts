import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import {
  dummyConversation,
  dummyDate,
  dummyIds,
  dummyMessage,
  dummyUser,
} from '~/dummies';
import { mockDate } from '~/globals/date';
import { RedisService } from '../service';

describe('Redis messages service', () => {
  let redisService: RedisService;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    redisService = app.get<RedisService>(RedisService);
    mockDate();
  });

  it('should be able to append new messages', async () => {
    redisService.appendMessage(dummyMessage);

    expect(redisService.client.rpush).toHaveBeenCalledWith(
      dummyMessage.conversationId,
      JSON.stringify({
        message: dummyMessage.content,
        userId: dummyMessage.senderId,
        timestamp: dummyDate,
      }),
    );
  });

  it('should be able to create conversation details', async () => {
    redisService.appendDetails({
      conversationId: dummyConversation.id,
      userId: dummyUser.id,
    });

    expect(redisService.client.set).toHaveBeenCalledWith(
      `details-${dummyConversation.id}`,
      JSON.stringify({
        conversationId: dummyConversation.id,
        users: [dummyUser.id],
        createdAt: dummyDate,
      }),
    );
  });

  it('should be able to add new users to conversation details', async () => {
    redisService.appendDetails({
      conversationId: dummyConversation.id,
      userId: dummyIds[0] as string,
    });

    redisService.appendDetails({
      conversationId: dummyConversation.id,
      userId: dummyIds[1] as string,
    });

    const redisSetter = redisService.client.set as jest.Mock;

    expect(redisSetter.mock.calls.pop()).toEqual([
      `details-${dummyConversation.id}`,
      JSON.stringify({
        conversationId: dummyConversation.id,
        users: [dummyIds[0], dummyIds[1]],
        createdAt: dummyDate,
      }),
    ]);
  });
});
