import { RedisDatasource } from '@/datasource/redis/datasource';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UseCase } from '../usecase.interface';
import type { User } from '../user.interface';
import { ConnectConversationDTO, ConnectConversationResultDTO } from './dto';

@Injectable()
export class ConnectConversationUseCase implements UseCase<ConnectConversationDTO, ConnectConversationResultDTO> {
  constructor(private readonly redis: RedisDatasource) {}

  async execute({ conversationId }: ConnectConversationDTO): Promise<ConnectConversationResultDTO> {
    const userId = randomUUID();

    if (!conversationId) {
      return this.createConversation(userId);
    }

    const existing = await this.redis.getDetails(conversationId);

    if (existing) {
      return { userId, conversationId };
    }

    return this.createConversation(userId);
  }

  private async createConversation(userId: User['id']): Promise<ConnectConversationResultDTO> {
    const conversationId = randomUUID();
    await this.redis.upsertDetails({ conversationId, userId });
    return { userId, conversationId };
  }
}
