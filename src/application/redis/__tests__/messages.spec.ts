import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { dummyDate, dummyMessage } from '~/dummies';
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((redisService as any).client.rpush).toHaveBeenCalledWith(
      dummyMessage.conversationId,
      JSON.stringify({
        message: dummyMessage.content,
        userId: dummyMessage.senderId,
        timestamp: dummyDate,
      }),
    );
  });
});
