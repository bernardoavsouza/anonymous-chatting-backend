import { RedisDatasource } from '@/datasource/redis/datasource';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { User } from '../../interfaces';
import { UseCase } from '../../interfaces';
import { ConnectConversationInputDTO, ConnectConversationOutputDTO } from '../dto';
import { Conversation } from '../interfaces';

@Injectable()
export class ConnectConversationUseCase implements UseCase<ConnectConversationInputDTO, ConnectConversationOutputDTO> {
  constructor(private readonly redis: RedisDatasource) {}

  async execute({ conversationId }: ConnectConversationInputDTO): Promise<ConnectConversationOutputDTO> {
    const userId = randomUUID();

    if (!conversationId) {
      const newConversationId = await this.createConversation(userId);
      return {
        userId,
        conversationId: newConversationId,
      };
    }

    const existing = await this.redis.getDetails(conversationId);

    if (existing) {
      return {
        userId,
        conversationId,
      };
    }

    const newConversationId = await this.createConversation(userId);
    return {
      userId,
      conversationId: newConversationId,
    };
  }

  private async createConversation(userId: User['id']): Promise<Conversation['id']> {
    const conversationId = randomUUID();
    await this.redis.upsertDetails({ conversationId, userId });
    return conversationId;
  }
}
