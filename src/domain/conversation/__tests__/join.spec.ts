import { RedisDatasource } from '@/datasource/redis/datasource';
import { Test } from '@nestjs/testing';
import { dummyConversation, dummyUsers } from '~/dummies';
import { JoinConversationUseCase } from '../usecases/join.usecase';

describe('JoinConversationUseCase', () => {
  let useCase: JoinConversationUseCase;

  const redisMock = {
    upsertDetails: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const app = await Test.createTestingModule({
      providers: [JoinConversationUseCase, { provide: RedisDatasource, useValue: redisMock }],
    }).compile();

    useCase = app.get(JoinConversationUseCase);
  });

  it('should save conversation details in redis', async () => {
    await useCase.execute({ conversationId: dummyConversation.id, userId: dummyUsers[0].id });

    expect(redisMock.upsertDetails).toHaveBeenCalledWith({ conversationId: dummyConversation.id, userId: dummyUsers[0].id });
  });
});
