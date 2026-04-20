import { RedisDatasource } from '@/datasource/redis/datasource';
import { ConnectConversationUseCase } from '@/domain/conversation/usecases/connect.usecase';
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

  it('should return a generated userId', async () => {
    const { userId } = await useCase.execute({ nickname: dummyUsers[0].nickname });

    expect(userId).toEqual(uuidMatcher);
  });

  it('should always return a new userId', async () => {
    const { userId: first } = await useCase.execute({ nickname: dummyUsers[0].nickname });
    const { userId: second } = await useCase.execute({ nickname: dummyUsers[0].nickname });

    expect(first).not.toBe(second);
  });

  it('should create a new conversation when none is provided', async () => {
    await useCase.execute({ nickname: dummyUsers[0].nickname });

    expect(redisMock.upsertDetails).toHaveBeenCalledWith({ conversationId: uuidMatcher, nickname: dummyUsers[0].nickname });
  });

  it('should return a new conversationId when none is provided', async () => {
    const { conversationId } = await useCase.execute({ nickname: dummyUsers[0].nickname });

    expect(conversationId).toEqual(uuidMatcher);
  });

  it('should not create a new conversation when it exists in redis', async () => {
    redisMock.getDetails.mockResolvedValueOnce({ conversationId: dummyConversation.id, users: [], createdAt: new Date() });

    await useCase.execute({ conversationId: dummyConversation.id, nickname: dummyUsers[0].nickname });

    expect(redisMock.upsertDetails).not.toHaveBeenCalled();
  });

  it('should return the same conversationId when it exists in redis', async () => {
    redisMock.getDetails.mockResolvedValueOnce({ conversationId: dummyConversation.id, users: [], createdAt: new Date() });

    const { conversationId } = await useCase.execute({ conversationId: dummyConversation.id, nickname: dummyUsers[0].nickname });

    expect(conversationId).toBe(dummyConversation.id);
  });

  it('should create a new conversation when the provided one is not found in redis', async () => {
    redisMock.getDetails.mockResolvedValueOnce(null);

    await useCase.execute({ conversationId: dummyConversation.id, nickname: dummyUsers[0].nickname });

    expect(redisMock.upsertDetails).toHaveBeenCalledWith({ conversationId: uuidMatcher, nickname: uuidMatcher });
  });

  it('should return a new conversationId when the provided one is not found in redis', async () => {
    redisMock.getDetails.mockResolvedValueOnce(null);

    const { conversationId } = await useCase.execute({ conversationId: dummyConversation.id, nickname: dummyUsers[0].nickname });

    expect(conversationId).toEqual(uuidMatcher);
    expect(conversationId).not.toBe(dummyConversation.id);
  });
});
