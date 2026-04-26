import { RedisDatasource } from '@/datasource/redis/datasource';
import { ConversationError } from '@/transport/errors/conversation.error';
import { Test } from '@nestjs/testing';
import { dummyConversation, dummyUsers } from '~/dummies';
import { LeaveConversationUseCase } from '../usecases/leave.usecase';

describe('LeaveConversationUseCase', () => {
  let useCase: LeaveConversationUseCase;

  const redisMock = {
    eraseConversation: jest.fn(),
    getDetails: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const app = await Test.createTestingModule({
      providers: [LeaveConversationUseCase, { provide: RedisDatasource, useValue: redisMock }],
    }).compile();

    useCase = app.get(LeaveConversationUseCase);
  });

  it('should erase conversation in redis on leave if you are the last user', async () => {
    redisMock.getDetails.mockResolvedValueOnce({ users: [dummyUsers[0].nickname] });

    await useCase.execute({ conversationId: dummyConversation.id, nickname: dummyUsers[0].nickname });

    expect(redisMock.eraseConversation).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should not erase conversation in redis on leave if you are not the last user', async () => {
    redisMock.getDetails.mockResolvedValueOnce({ users: [dummyUsers[0].nickname, dummyUsers[1].nickname] });

    await useCase.execute({ conversationId: dummyConversation.id, nickname: dummyUsers[1].nickname });

    expect(redisMock.eraseConversation).not.toHaveBeenCalled();
  });

  it('should not erase conversation in redis when conversation details are not found', async () => {
    redisMock.getDetails.mockResolvedValueOnce(null);

    await useCase.execute({ conversationId: dummyConversation.id, nickname: dummyUsers[0].nickname });

    expect(redisMock.eraseConversation).not.toHaveBeenCalled();
  });

  it('should throw ConversationError when redis.getDetails rejects', async () => {
    redisMock.getDetails.mockRejectedValueOnce(new Error('redis down'));

    await expect(useCase.execute({ conversationId: dummyConversation.id, nickname: dummyUsers[0].nickname })).rejects.toBeInstanceOf(
      ConversationError,
    );
  });

  it('should throw ConversationError when redis.eraseConversation rejects', async () => {
    redisMock.getDetails.mockResolvedValueOnce({ users: [dummyUsers[0].nickname] });
    redisMock.eraseConversation.mockRejectedValueOnce(new Error('redis down'));

    await expect(useCase.execute({ conversationId: dummyConversation.id, nickname: dummyUsers[0].nickname })).rejects.toBeInstanceOf(
      ConversationError,
    );
  });
});
