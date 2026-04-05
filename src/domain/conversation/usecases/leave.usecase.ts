import { ConversationEvent } from '@/transport/conversation/types';
import { InputPort } from '@/transport/ports';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UseCase } from '../../interfaces';
import { LeaveConversationDTO } from '../dto';

type LeaveInput = { socket: Socket } & LeaveConversationDTO;

@Injectable()
export class LeaveConversationUseCase implements UseCase<LeaveInput> {
  async execute({ socket, ...data }: LeaveInput): Promise<void> {
    socket.leave(data.conversationId);
    socket.to(data.conversationId).emit(ConversationEvent.LEAVE, {
      data,
      timestamp: new Date(),
    } satisfies InputPort<LeaveConversationDTO>);
  }
}
