import { RedisDatasource } from '@/datasource/redis/datasource';
import { ConversationEvent } from '@/transport/conversation/types';
import { InputPort } from '@/transport/ports';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UseCase } from '../../interfaces';
import { JoinConversationDTO } from '../dto';

type JoinInput = { socket: Socket } & JoinConversationDTO;

@Injectable()
export class JoinConversationUseCase implements UseCase<JoinInput> {
  constructor(private readonly redis: RedisDatasource) {}

  async execute({ socket, ...data }: JoinInput): Promise<void> {
    socket.join(data.conversationId);
    socket.to(data.conversationId).emit(ConversationEvent.JOIN, {
      data,
      timestamp: new Date(),
    } satisfies InputPort<JoinConversationDTO>);

    await this.redis.upsertDetails({ conversationId: data.conversationId, userId: data.userId });
  }
}
