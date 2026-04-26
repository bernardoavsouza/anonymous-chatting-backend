import { RedisDatasource } from '@/datasource/redis/datasource';
import { ErrorCode } from '@/transport/errors/codes';
import { ConversationError } from '@/transport/errors/conversation.error';
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../interfaces';
import { SendMessageDTO } from '../dto';

@Injectable()
export class SendMessageUseCase implements UseCase<SendMessageDTO> {
  constructor(private readonly redis: RedisDatasource) {}

  async execute(data: SendMessageDTO): Promise<void> {
    try {
      await this.redis.appendMessage(data);
    } catch (error) {
      throw new ConversationError(ErrorCode.INTERNAL_ERROR, (error as Error).message);
    }
  }
}
