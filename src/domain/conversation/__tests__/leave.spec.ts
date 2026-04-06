import { RedisDatasource } from '@/datasource/redis/datasource';
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
    redisMock.getDetails.mockResolvedValueOnce({ users: [dummyUsers[0].id] });

    await useCase.execute({ conversationId: dummyConversation.id, userId: dummyUsers[0].id });

    expect(redisMock.eraseConversation).toHaveBeenCalledWith(dummyConversation.id);
  });

  it('should not erase conversation in redis on leave if you are not the last user', async () => {
    redisMock.getDetails.mockResolvedValueOnce({ users: [dummyUsers[0].id, dummyUsers[1].id] });

    await useCase.execute({ conversationId: dummyConversation.id, userId: dummyUsers[1].id });

    expect(redisMock.eraseConversation).not.toHaveBeenCalled();
  });
});
