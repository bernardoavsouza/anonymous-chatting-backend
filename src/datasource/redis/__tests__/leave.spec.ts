import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { dummyConversation, dummyMessage } from '~/dummies';
import { mockDate } from '~/globals/date';
import { RedisDatasource } from '../datasource';

describe('Redis leave service', () => {
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

  it('should be able to erase conversation records', async () => {
    redisService.eraseConversation(dummyConversation.id);

    expect(redisService.client.del).toHaveBeenCalledWith(dummyMessage.conversationId);
  });
});
