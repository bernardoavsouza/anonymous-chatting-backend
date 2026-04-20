import { ConnectConversationUseCase } from '@/domain/conversation/usecases/connect.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { ConversationEvent } from './conversation/types';
import type { InputPort } from './ports';
import type { AppSocket, ConnectedInConversationDTO, LeftConversationDTO } from './types';

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
      nickname,
    });

    client.data = { userId, nickname, conversationId };
    client.join(conversationId);
    client.to(conversationId).emit(ConversationEvent.JOIN, {
      data: { nickname, conversationId },
      timestamp: new Date(),
    } satisfies InputPort<ConnectedInConversationDTO>);
  }

  async handleDisconnect(client: AppSocket): Promise<void> {
    const { userId, nickname, conversationId } = client.data;
    if (!userId || !nickname || !conversationId) return;

    await this.leaveConversationUseCase.execute({ nickname, conversationId });

    client.leave(conversationId);
    client
      .to(conversationId)
      .emit(ConversationEvent.LEAVE, { data: { nickname, conversationId }, timestamp: new Date() } satisfies InputPort<LeftConversationDTO>);
  }
}
