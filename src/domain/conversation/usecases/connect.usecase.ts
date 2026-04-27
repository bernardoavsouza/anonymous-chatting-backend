import { RedisDatasource } from '@/datasource/redis/datasource';
import { ErrorCode } from '@/transport/errors/codes';
import { ConversationError } from '@/transport/errors/conversation.error';
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { User } from '../../interfaces';
import { UseCase } from '../../interfaces';
import { ConnectConversationInputDTO, ConnectConversationOutputDTO } from '../dto';
import { Conversation } from '../interfaces';

@Injectable()
export class ConnectConversationUseCase implements UseCase<ConnectConversationInputDTO, ConnectConversationOutputDTO> {
  private readonly logger = new Logger(ConnectConversationUseCase.name);

  constructor(private readonly redis: RedisDatasource) {}

  async execute({ conversationId, nickname }: ConnectConversationInputDTO): Promise<ConnectConversationOutputDTO> {
    const userId = randomUUID();
    this.logger.log('execute: starting', JSON.stringify({ nickname, suggestedConversationId: conversationId ?? null }));

    if (!conversationId) {
      this.logger.log('execute: no conversationId, creating new', JSON.stringify({ nickname }));
      const newConversationId = await this.createConversation(nickname);
      return { userId, conversationId: newConversationId };
    }

    this.logger.log('execute: checking Redis for existing conversation', JSON.stringify({ nickname, conversationId }));
    let existing;
    try {
      existing = await this.redis.getDetails(conversationId);
    } catch (error) {
      this.logger.error('execute: Redis error fetching details', JSON.stringify({ conversationId, error: (error as Error).message }));
      throw new ConversationError(ErrorCode.INTERNAL_ERROR, (error as Error).message);
    }

    if (existing) {
      this.logger.log('execute: conversation found, joining', JSON.stringify({ nickname, conversationId }));
      return { userId, conversationId };
    }

    this.logger.warn('execute: conversation not found in Redis, creating new', JSON.stringify({ nickname, suggestedConversationId: conversationId }));
    const newConversationId = await this.createConversation(userId);
    return { userId, conversationId: newConversationId };
  }

  private async createConversation(nickname: User['nickname']): Promise<Conversation['id']> {
    const conversationId = randomUUID();
    this.logger.log('createConversation: creating', JSON.stringify({ nickname, conversationId }));
    try {
      await this.redis.upsertDetails({ conversationId, nickname });
    } catch (error) {
      this.logger.error('createConversation: Redis error', JSON.stringify({ conversationId, error: (error as Error).message }));
      throw new ConversationError(ErrorCode.INTERNAL_ERROR, (error as Error).message);
    }
    return conversationId;
  }
}
