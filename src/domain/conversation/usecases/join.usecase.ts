import { ConversationEvent } from '@/transport/conversation/types';
import { InputPort } from '@/transport/ports';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UseCase } from '../../interfaces';
import { JoinConversationDTO } from '../dto';

type JoinInput = { socket: Socket } & JoinConversationDTO;

@Injectable()
export class JoinConversationUseCase implements UseCase<JoinInput> {
  async execute({ socket, ...data }: JoinInput): Promise<void> {
    socket.join(data.conversationId);
    socket.to(data.conversationId).emit(ConversationEvent.JOIN, {
      data,
      timestamp: new Date(),
    } satisfies InputPort<JoinConversationDTO>);
  }
}
