import { ConversationEvent } from '@/transport/conversation/types';
import type { InputPort } from '@/transport/ports';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UseCase } from '../../interfaces';
import { LeaveConversationDTO } from '../dto';
import { LeaveConversationUseCase } from './leave.usecase';

@Injectable()
export class DisconnectConversationUseCase implements UseCase<Socket> {
  constructor(private readonly leaveConversationUseCase: LeaveConversationUseCase) {}

  async execute(socket: Socket): Promise<void> {
    const { userId, conversationId } = socket.data;
    if (!userId || !conversationId) return;

    await this.leaveConversationUseCase.execute({ userId, conversationId });

    socket.leave(conversationId);
    socket
      .to(conversationId)
      .emit(ConversationEvent.LEAVE, { data: { userId, conversationId }, timestamp: new Date() } satisfies InputPort<LeaveConversationDTO>);
  }
}
