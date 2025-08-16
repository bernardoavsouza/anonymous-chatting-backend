import { dummyDate } from '@/__mocks__/socket.io';
import { Message } from '@/core/message.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis({
      host: this.config.getOrThrow('redis.host'),
      port: this.config.getOrThrow('redis.port'),
      username: this.config.getOrThrow('redis.username'),
      password: this.config.getOrThrow('redis.password'),
    });
  }

  appendMessage(message: Message): void {
    this.client.rpush(
      message.conversationId,
      JSON.stringify({
        message: message.content,
        userId: message.senderId,
        timestamp: dummyDate,
      }),
    );
  }
}
