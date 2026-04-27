import { RedisDatasource } from '@/datasource/redis/datasource';
import { ErrorCode } from '@/transport/errors/codes';
import { ConversationError } from '@/transport/errors/conversation.error';
import { Injectable, Logger } from '@nestjs/common';
import { UseCase } from '../../interfaces';
import { SendMessageDTO } from '../dto';

@Injectable()
export class SendMessageUseCase implements UseCase<SendMessageDTO> {
  private readonly logger = new Logger(SendMessageUseCase.name);

  constructor(private readonly redis: RedisDatasource) {}

  async execute(data: SendMessageDTO): Promise<void> {
    this.logger.log('execute: persisting message', JSON.stringify({ conversationId: data.conversationId, nickname: data.nickname }));
    try {
      await this.redis.appendMessage(data);
      this.logger.log('execute: message persisted', JSON.stringify({ conversationId: data.conversationId }));
    } catch (error) {
      this.logger.error('execute: Redis error', JSON.stringify({ conversationId: data.conversationId, error: (error as Error).message }));
      throw new ConversationError(ErrorCode.INTERNAL_ERROR, (error as Error).message);
    }
  }
}
