import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { dummyConversation, dummyMessage } from '~/dummies';
import { mockDate } from '~/globals/date';
import { RedisService } from '../service';

describe('Redis leave service', () => {
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

  it('should be able to erase conversation records', async () => {
    redisService.eraseConversation(dummyConversation.id);

    expect(redisService.client.del).toHaveBeenCalledWith(
      dummyMessage.conversationId,
    );
  });
});
