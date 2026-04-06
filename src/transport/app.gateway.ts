import { LeaveConversationDTO } from '@/domain/conversation/dto';
import { ConnectConversationUseCase } from '@/domain/conversation/usecases/connect.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ConversationEvent } from './conversation/types';
import type { InputPort } from './ports';

@Injectable()
@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly connectConversationUseCase: ConnectConversationUseCase,
    private readonly leaveConversationUseCase: LeaveConversationUseCase,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const { nickname, conversationId } = client.handshake.auth;
    client.data = await this.connectConversationUseCase.execute({ nickname, conversationId });
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const { userId, conversationId } = client.data;
    if (!userId || !conversationId) return;

    await this.leaveConversationUseCase.execute({ userId, conversationId });

    client.leave(conversationId);
    client
      .to(conversationId)
      .emit(ConversationEvent.LEAVE, { data: { userId, conversationId }, timestamp: new Date() } satisfies InputPort<LeaveConversationDTO>);
  }
}
