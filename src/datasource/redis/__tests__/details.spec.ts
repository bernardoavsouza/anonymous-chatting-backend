import type { ConversationDetails } from '@/domain/conversation/interfaces';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { dummyConversation, dummyDate, dummyUsers } from '~/dummies';
import { mockDate } from '~/globals/date';
import { RedisDatasource } from '../datasource';

describe('Redis getDetails service', () => {
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

  it('should return null when conversation does not exist', async () => {
    const result = await redisService.getDetails(dummyConversation.id);

    expect(result).toBeNull();
  });

  it('should return parsed conversation details when conversation exists', async () => {
    await redisService.upsertDetails({
      conversationId: dummyConversation.id,
      nickname: dummyUsers[0].nickname,
    });

    const result = await redisService.getDetails(dummyConversation.id);

    expect(result).toEqual({
      conversationId: dummyConversation.id,
      users: [dummyUsers[0].nickname],
      createdAt: dummyDate,
    } satisfies ConversationDetails);
  });

  it('should return all users when multiple users have joined', async () => {
    await redisService.upsertDetails({
      conversationId: dummyConversation.id,
      nickname: dummyUsers[0].nickname,
    });
    await redisService.upsertDetails({
      conversationId: dummyConversation.id,
      nickname: dummyUsers[1].nickname,
    });

    const result = await redisService.getDetails(dummyConversation.id);

    expect(result?.users).toEqual([dummyUsers[0].nickname, dummyUsers[1].nickname]);
  });
});
