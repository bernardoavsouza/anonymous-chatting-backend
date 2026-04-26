import { ConnectConversationUseCase } from '@/domain/conversation/usecases/connect.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { ErrorCode } from '@/transport/errors/codes';
import { ConversationError } from '@/transport/errors/conversation.error';
import { WsExceptionFilter } from '@/transport/filters/ws-exception.filter';
import { Injectable, Logger, UseFilters } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { ConversationEvent } from './conversation/types';
import type { InputPort } from './ports';
import type { AppSocket, ConnectedInConversationDTO, LeftConversationDTO } from './types';

@Injectable()
@UseFilters(new WsExceptionFilter())
@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AppGateway.name);

  constructor(
    private readonly connectConversationUseCase: ConnectConversationUseCase,
    private readonly leaveConversationUseCase: LeaveConversationUseCase,
  ) {}

  async handleConnection(client: AppSocket): Promise<void> {
    const { nickname, conversationId: suggestedConversationId } = client.handshake.auth;

    if (!nickname || !nickname.trim()) {
      client.emit('error', { code: ErrorCode.INVALID_AUTH, message: 'Nickname is required' });
      client.disconnect();
      return;
    }

    try {
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
    } catch (error) {
      const code = error instanceof ConversationError ? error.code : ErrorCode.INTERNAL_ERROR;
      const message = error instanceof ConversationError ? error.message : 'Internal Server Error';
      client.emit('error', { code, message });
      client.disconnect();
    }
  }

  async handleDisconnect(client: AppSocket): Promise<void> {
    const { userId, nickname, conversationId } = client.data;
    if (!userId || !nickname || !conversationId) return;

    try {
      await this.leaveConversationUseCase.execute({ nickname, conversationId });

      client.leave(conversationId);
      client
        .to(conversationId)
        .emit(ConversationEvent.LEAVE, { data: { nickname, conversationId }, timestamp: new Date() } satisfies InputPort<LeftConversationDTO>);
    } catch (error) {
      this.logger.error('Error during disconnect cleanup', error);
    }
  }
}
