import { RedisDatasource } from '@/datasource/redis/datasource';
import { ErrorCode } from '@/transport/errors/codes';
import { ConversationError } from '@/transport/errors/conversation.error';
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../interfaces';
import { LeaveConversationDTO } from '../dto';

@Injectable()
export class LeaveConversationUseCase implements UseCase<LeaveConversationDTO, void> {
  constructor(private readonly redis: RedisDatasource) {}

  async execute(data: LeaveConversationDTO): Promise<void> {
    let details;
    try {
      details = await this.redis.getDetails(data.conversationId);
    } catch (error) {
      throw new ConversationError(ErrorCode.INTERNAL_ERROR, (error as Error).message);
    }

    const isLastUser = !!details?.users.length && details.users[0] === data.nickname;
    if (isLastUser) {
      try {
        await this.redis.eraseConversation(data.conversationId);
      } catch (error) {
        throw new ConversationError(ErrorCode.INTERNAL_ERROR, (error as Error).message);
      }
    }
  }
}
