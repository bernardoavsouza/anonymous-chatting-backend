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

  eraseConversation(conversationId: string): void {
    this.client.del(conversationId);
  }
}
