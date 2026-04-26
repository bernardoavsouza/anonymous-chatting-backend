import { RedisDatasource } from '@/datasource/redis/datasource';
import { ConversationError } from '@/transport/errors/conversation.error';
import { Test } from '@nestjs/testing';
import { dummyMessage } from '~/dummies';
import { SendMessageUseCase } from '../usecases/send-message.usecase';

describe('SendMessageUseCase', () => {
  let useCase: SendMessageUseCase;

  const redisMock = {
    appendMessage: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const app = await Test.createTestingModule({
      providers: [SendMessageUseCase, { provide: RedisDatasource, useValue: redisMock }],
    }).compile();

    useCase = app.get(SendMessageUseCase);
  });

  it('should save message in redis', async () => {
    await useCase.execute(dummyMessage);

    expect(redisMock.appendMessage).toHaveBeenCalledWith(dummyMessage);
  });

  it('should throw ConversationError when redis.appendMessage rejects', async () => {
    redisMock.appendMessage.mockRejectedValueOnce(new Error('redis down'));

    await expect(useCase.execute(dummyMessage)).rejects.toBeInstanceOf(ConversationError);
  });
});
