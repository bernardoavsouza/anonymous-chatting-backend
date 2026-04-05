import { RedisDatasource } from '@/datasource/redis/datasource';
import type { Conversation } from '@/domain/conversation/interfaces';
import type { User } from '@/domain/user.interface';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export class ConnectConversationDTO {
  nickname: string;
  conversationId?: Conversation['id'];
}

export class ConnectConversationResultDTO {
  userId: User['id'];
  conversationId: Conversation['id'];
}

@Injectable()
export class ConnectConversationUseCase {
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
