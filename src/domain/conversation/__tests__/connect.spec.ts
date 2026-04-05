import { RedisDatasource } from '@/datasource/redis/datasource';
import { ConnectConversationUseCase } from '@/domain/conversation/connect.usecase';
import { Test } from '@nestjs/testing';
import { dummyConversation, dummyUsers } from '~/dummies';

const uuidMatcher = expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

describe('ConnectConversationUseCase', () => {
  let useCase: ConnectConversationUseCase;

  const redisMock = {
    getDetails: jest.fn(),
    upsertDetails: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const app = await Test.createTestingModule({
      providers: [ConnectConversationUseCase, { provide: RedisDatasource, useValue: redisMock }],
    }).compile();

    useCase = app.get(ConnectConversationUseCase);
  });

  it('should return a new conversationId when none is provided', async () => {
    const result = await useCase.execute({ nickname: dummyUsers[0].nickname });

    expect(redisMock.getDetails).not.toHaveBeenCalled();
    expect(redisMock.upsertDetails).toHaveBeenCalledWith({ conversationId: result.conversationId, userId: result.userId });
    expect(result.conversationId).toEqual(uuidMatcher);
  });

  it('should return the same conversationId when it exists in redis', async () => {
    redisMock.getDetails.mockResolvedValueOnce({ conversationId: dummyConversation.id, users: [], createdAt: new Date() });

    const result = await useCase.execute({ nickname: dummyUsers[0].nickname, conversationId: dummyConversation.id });

    expect(result.conversationId).toBe(dummyConversation.id);
  });

  it('should return a new conversationId when the provided one is not found in redis', async () => {
    redisMock.getDetails.mockResolvedValueOnce(null);

    const result = await useCase.execute({ nickname: dummyUsers[0].nickname, conversationId: dummyConversation.id });

    expect(result.conversationId).not.toBe(dummyConversation.id);
    expect(result.conversationId).toEqual(uuidMatcher);
    expect(redisMock.upsertDetails).toHaveBeenCalledWith({ conversationId: result.conversationId, userId: result.userId });
  });

  it('should always return a new userId', async () => {
    redisMock.getDetails.mockResolvedValue(null);

    const first = await useCase.execute({ nickname: dummyUsers[0].nickname });
    const second = await useCase.execute({ nickname: dummyUsers[1].nickname });

    expect(first.userId).not.toBe(second.userId);
  });
});
