import { RedisDatasource } from '@/datasource/redis/datasource';
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../interfaces';
import { JoinConversationDTO } from '../dto';

@Injectable()
export class JoinConversationUseCase implements UseCase<JoinConversationDTO> {
  constructor(private readonly redis: RedisDatasource) {}

  async execute(data: JoinConversationDTO): Promise<void> {
    await this.redis.upsertDetails({ conversationId: data.conversationId, userId: data.userId });
  }
}
