import { Conversation, ConversationDetails, Message } from '@/domain/conversation/interfaces';
import { User } from '@/domain/interfaces';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import Redis from 'ioredis';

@Injectable()
export class RedisDatasource {
  readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis(this.config.getOrThrow('redis.url'));
  }

  async appendMessage(message: Message): Promise<void> {
    await this.client.rpush(
      message.conversationId,
      JSON.stringify({
        content: message.content,
        nickname: message.nickname,
        createdAt: new Date(),
      } satisfies Omit<Message, 'conversationId'>),
    );
  }

  async getDetails(conversationId: Conversation['id']): Promise<ConversationDetails | null> {
    const details = await this.client.get(`details-${conversationId}`);
    if (!details) {
      return null;
    }

    return plainToInstance(ConversationDetails, JSON.parse(details));
  }

  async upsertDetails({ conversationId, nickname }: { conversationId: Conversation['id']; nickname: User['nickname'] }): Promise<void> {
    const details = await this.getDetails(conversationId);

    if (!details) {
      await this.client.set(
        `details-${conversationId}`,
        JSON.stringify({
          conversationId,
          users: [nickname],
          createdAt: new Date(),
        } satisfies ConversationDetails),
      );
      return;
    }

    await this.client.set(
      `details-${conversationId}`,
      JSON.stringify({
        ...details,
        users: [...details.users, nickname],
      } satisfies ConversationDetails),
    );
  }

  async eraseConversation(conversationId: Conversation['id']): Promise<void> {
    await this.client.del(conversationId);
  }
}
