import { ConnectedConversationDTO, LeaveConversationDTO } from '@/domain/conversation/dto';
import { ConnectConversationUseCase } from '@/domain/conversation/usecases/connect.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { ConversationEvent } from './conversation/types';
import type { InputPort } from './ports';
import type { AppSocket } from './types';

@Injectable()
@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly connectConversationUseCase: ConnectConversationUseCase,
    private readonly leaveConversationUseCase: LeaveConversationUseCase,
  ) {}

  async handleConnection(client: AppSocket): Promise<void> {
    const { nickname, conversationId: suggestedConversationId } = client.handshake.auth;
    const { userId, conversationId } = await this.connectConversationUseCase.execute({
      conversationId: suggestedConversationId,
    });

    client.data = { userId, conversationId };
    client.join(conversationId);
    client.to(conversationId).emit(ConversationEvent.JOIN, {
      data: { nickname, userId, conversationId },
      timestamp: new Date(),
    } satisfies InputPort<ConnectedConversationDTO>);
  }

  async handleDisconnect(client: AppSocket): Promise<void> {
    const { userId, conversationId } = client.data;
    if (!userId || !conversationId) return;

    await this.leaveConversationUseCase.execute({ userId, conversationId });

    client.leave(conversationId);
    client
      .to(conversationId)
      .emit(ConversationEvent.LEAVE, { data: { userId, conversationId }, timestamp: new Date() } satisfies InputPort<LeaveConversationDTO>);
  }
}
