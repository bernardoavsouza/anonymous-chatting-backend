import { Message } from '@/core/message.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis(this.config.getOrThrow('redis.url'));
  }

  async appendMessage(message: Message): Promise<void> {
    await this.client.rpush(
      message.conversationId,
      JSON.stringify({
        message: message.content,
        userId: message.senderId,
        timestamp: new Date(),
      }),
    );
  }

  async eraseConversation(conversationId: string): Promise<void> {
    await this.client.del(conversationId);
  }
}
