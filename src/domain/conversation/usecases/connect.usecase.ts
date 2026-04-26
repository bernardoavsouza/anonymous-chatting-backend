import { RedisDatasource } from '@/datasource/redis/datasource';
import { ErrorCode } from '@/transport/errors/codes';
import { ConversationError } from '@/transport/errors/conversation.error';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { User } from '../../interfaces';
import { UseCase } from '../../interfaces';
import { ConnectConversationInputDTO, ConnectConversationOutputDTO } from '../dto';
import { Conversation } from '../interfaces';

@Injectable()
export class ConnectConversationUseCase implements UseCase<ConnectConversationInputDTO, ConnectConversationOutputDTO> {
  constructor(private readonly redis: RedisDatasource) {}

  async execute({ conversationId, nickname }: ConnectConversationInputDTO): Promise<ConnectConversationOutputDTO> {
    const userId = randomUUID();

    if (!conversationId) {
      const newConversationId = await this.createConversation(nickname);
      return { userId, conversationId: newConversationId };
    }

    let existing;
    try {
      existing = await this.redis.getDetails(conversationId);
    } catch (error) {
      throw new ConversationError(ErrorCode.INTERNAL_ERROR, (error as Error).message);
    }

    if (existing) {
      return { userId, conversationId };
    }

    const newConversationId = await this.createConversation(userId);
    return { userId, conversationId: newConversationId };
  }

  private async createConversation(nickname: User['nickname']): Promise<Conversation['id']> {
    const conversationId = randomUUID();
    try {
      await this.redis.upsertDetails({ conversationId, nickname });
    } catch (error) {
      throw new ConversationError(ErrorCode.INTERNAL_ERROR, (error as Error).message);
    }
    return conversationId;
  }
}
