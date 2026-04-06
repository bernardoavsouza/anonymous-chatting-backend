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
        message: dummyMessage.content,
        userId: dummyMessage.senderId,
        timestamp: dummyDate,
      }),
    );
  });

  it('should be able to create conversation details', async () => {
    await redisService.upsertDetails({
      conversationId: dummyConversation.id,
      userId: dummyUsers[0].id,
    });

    expect(redisService.client.set).toHaveBeenCalledWith(
      `details-${dummyConversation.id}`,
      JSON.stringify({
        conversationId: dummyConversation.id,
        users: [dummyUsers[0].id],
        createdAt: dummyDate,
      }),
    );
  });

  it('should be able to add new users to conversation details', async () => {
    await redisService.upsertDetails({
      conversationId: dummyConversation.id,
      userId: dummyUsers[0].id,
    });

    await redisService.upsertDetails({
      conversationId: dummyConversation.id,
      userId: dummyUsers[1].id,
    });

    const redisSetter = redisService.client.set as jest.Mock;

    expect(redisSetter.mock.calls.pop()).toEqual([
      `details-${dummyConversation.id}`,
      JSON.stringify({
        conversationId: dummyConversation.id,
        users: [dummyUsers[0].id, dummyUsers[1].id],
        createdAt: dummyDate,
      }),
    ]);
  });
});
