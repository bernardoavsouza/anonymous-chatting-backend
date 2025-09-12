import { Conversation } from '@/core/conversation.interface';
import { Message } from '@/core/message.interface';
import { User } from '@/core/user.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis(this.config.getOrThrow('redis.url'));
  }

  appendMessage(message: Message): void {
    this.client.rpush(
      message.conversationId,
      JSON.stringify({
        message: message.content,
        userId: message.senderId,
        timestamp: new Date(),
      }),
    );
  }

  appendDetails({
    conversationId,
    userId,
  }: {
    conversationId: Conversation['id'];
    userId: User['id'];
  }): void {
    this.client.set(
      `details-${conversationId}`,
      JSON.stringify({
        conversationId,
        users: [userId],
        createdAt: new Date(),
      }),
    );
  }

  eraseConversation(conversationId: Conversation['id']): void {
    this.client.del(conversationId);
  }
}
