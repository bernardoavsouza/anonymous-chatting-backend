import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UseCase } from '../../interfaces';
import { LeaveConversationUseCase } from './leave.usecase';

@Injectable()
export class DisconnectConversationUseCase implements UseCase<Socket> {
  constructor(private readonly leaveConversationUseCase: LeaveConversationUseCase) {}

  async execute(socket: Socket): Promise<void> {
    const { userId, conversationId } = socket.data;
    if (!userId || !conversationId) return;
    await this.leaveConversationUseCase.execute({ socket, userId, conversationId });
  }
}
