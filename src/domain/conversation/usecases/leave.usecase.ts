import { RedisDatasource } from '@/datasource/redis/datasource';
import { ErrorCode } from '@/transport/errors/codes';
import { ConversationError } from '@/transport/errors/conversation.error';
import { Injectable, Logger } from '@nestjs/common';
import { UseCase } from '../../interfaces';
import { LeaveConversationDTO } from '../dto';

@Injectable()
export class LeaveConversationUseCase implements UseCase<LeaveConversationDTO, void> {
  private readonly logger = new Logger(LeaveConversationUseCase.name);

  constructor(private readonly redis: RedisDatasource) {}

  async execute(data: LeaveConversationDTO): Promise<void> {
    this.logger.log('execute: starting', JSON.stringify({ nickname: data.nickname, conversationId: data.conversationId }));

    let details;
    try {
      details = await this.redis.getDetails(data.conversationId);
    } catch (error) {
      this.logger.error(
        'execute: Redis error fetching details',
        JSON.stringify({ conversationId: data.conversationId, error: (error as Error).message }),
      );
      throw new ConversationError(ErrorCode.INTERNAL_ERROR, (error as Error).message);
    }

    if (!details) {
      this.logger.warn('execute: conversation not found in Redis', JSON.stringify({ conversationId: data.conversationId }));
      return;
    }

    const isLastUser = !!details.users.length && details.users[0] === data.nickname;
    if (isLastUser) {
      this.logger.log('execute: last user, erasing conversation', JSON.stringify({ nickname: data.nickname, conversationId: data.conversationId }));
      try {
        await this.redis.eraseConversation(data.conversationId);
        this.logger.log('execute: conversation erased', JSON.stringify({ conversationId: data.conversationId }));
      } catch (error) {
        this.logger.error(
          'execute: Redis error erasing conversation',
          JSON.stringify({ conversationId: data.conversationId, error: (error as Error).message }),
        );
        throw new ConversationError(ErrorCode.INTERNAL_ERROR, (error as Error).message);
      }
    } else {
      this.logger.log('execute: user left, conversation persists', JSON.stringify({ nickname: data.nickname, conversationId: data.conversationId }));
    }
  }
}
