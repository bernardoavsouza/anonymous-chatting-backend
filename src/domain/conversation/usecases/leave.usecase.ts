import { RedisDatasource } from '@/datasource/redis/datasource';
import { ConversationEvent } from '@/transport/conversation/types';
import { InputPort } from '@/transport/ports';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UseCase } from '../../interfaces';
import { LeaveConversationDTO } from '../dto';

type LeaveInput = { socket: Socket } & LeaveConversationDTO;

@Injectable()
export class LeaveConversationUseCase implements UseCase<LeaveInput> {
  constructor(private readonly redis: RedisDatasource) {}

  async execute({ socket, ...data }: LeaveInput): Promise<void> {
    socket.leave(data.conversationId);
    socket.to(data.conversationId).emit(ConversationEvent.LEAVE, {
      data,
      timestamp: new Date(),
    } satisfies InputPort<LeaveConversationDTO>);

    const details = await this.redis.getDetails(data.conversationId);
    const isLastUser = !!details?.users.length && details.users[0] === data.userId;
    if (isLastUser) {
      await this.redis.eraseConversation(data.conversationId);
    }
  }
}
