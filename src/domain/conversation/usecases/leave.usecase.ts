import { RedisDatasource } from '@/datasource/redis/datasource';
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../interfaces';
import { LeaveConversationDTO } from '../dto';

@Injectable()
export class LeaveConversationUseCase implements UseCase<LeaveConversationDTO, void> {
  constructor(private readonly redis: RedisDatasource) {}

  async execute(data: LeaveConversationDTO): Promise<void> {
    const details = await this.redis.getDetails(data.conversationId);

    const isLastUser = !!details?.users.length && details.users[0] === data.nickname;
    if (isLastUser) {
      await this.redis.eraseConversation(data.conversationId);
    }
  }
}
