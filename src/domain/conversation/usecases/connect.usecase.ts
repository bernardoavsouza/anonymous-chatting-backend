import { RedisDatasource } from '@/datasource/redis/datasource';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { User } from '../../interfaces';
import { UseCase } from '../../interfaces';
import { ConnectConversationDTO } from '../dto';

@Injectable()
export class ConnectConversationUseCase implements UseCase<ConnectConversationDTO, User['id']> {
  constructor(private readonly redis: RedisDatasource) {}

  async execute({ conversationId }: ConnectConversationDTO): Promise<User['id']> {
    const userId = randomUUID();

    if (!conversationId) {
      await this.createConversation(userId);
      return userId;
    }

    const existing = await this.redis.getDetails(conversationId);

    if (existing) {
      return userId;
    }

    await this.createConversation(userId);
    return userId;
  }

  private async createConversation(userId: User['id']): Promise<void> {
    const conversationId = randomUUID();
    await this.redis.upsertDetails({ conversationId, userId });
  }
}
