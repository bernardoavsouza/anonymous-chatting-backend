import { Conversation, ConversationDetails, Message } from '@/domain/conversation/interfaces';
import { User } from '@/domain/interfaces';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import Redis from 'ioredis';

@Injectable()
export class RedisDatasource {
  private readonly logger = new Logger(RedisDatasource.name);
  readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis(this.config.getOrThrow('redis.url'));
  }

  async appendMessage(message: Message): Promise<void> {
    try {
      await this.client.rpush(
        message.conversationId,
        JSON.stringify({
          content: message.content,
          nickname: message.nickname,
          createdAt: new Date(),
        } satisfies Omit<Message, 'conversationId'>),
      );
    } catch (error) {
      this.logger.error('appendMessage: RPUSH failed', JSON.stringify({ conversationId: message.conversationId, error: (error as Error).message }));
      throw error;
    }
  }

  async getDetails(conversationId: Conversation['id']): Promise<ConversationDetails | null> {
    let details: string | null;
    try {
      details = await this.client.get(`details-${conversationId}`);
    } catch (error) {
      this.logger.error('getDetails: GET failed', JSON.stringify({ conversationId, error: (error as Error).message }));
      throw error;
    }

    if (!details) {
      return null;
    }

    return plainToInstance(ConversationDetails, JSON.parse(details));
  }

  async upsertDetails({ conversationId, nickname }: { conversationId: Conversation['id']; nickname: User['nickname'] }): Promise<void> {
    const details = await this.getDetails(conversationId);

    if (!details) {
      try {
        await this.client.set(
          `details-${conversationId}`,
          JSON.stringify({
            conversationId,
            users: [nickname],
            createdAt: new Date(),
          } satisfies ConversationDetails),
        );
      } catch (error) {
        this.logger.error('upsertDetails: SET failed', JSON.stringify({ conversationId, error: (error as Error).message }));
        throw error;
      }
      return;
    }

    try {
      await this.client.set(
        `details-${conversationId}`,
        JSON.stringify({
          ...details,
          users: [...details.users, nickname],
        } satisfies ConversationDetails),
      );
    } catch (error) {
      this.logger.error('upsertDetails: SET failed', JSON.stringify({ conversationId, error: (error as Error).message }));
      throw error;
    }
  }

  async eraseConversation(conversationId: Conversation['id']): Promise<void> {
    try {
      await this.client.del(conversationId);
    } catch (error) {
      this.logger.error('eraseConversation: DEL failed', JSON.stringify({ conversationId, error: (error as Error).message }));
      throw error;
    }
  }
}
