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
    this.logger.log('handleConnection: client connecting', JSON.stringify({ socketId: client.id, nickname, suggestedConversationId }));

    if (!nickname || !nickname.trim()) {
      this.logger.warn('handleConnection: missing nickname, rejecting', JSON.stringify({ socketId: client.id }));
      client.emit('error', { code: ErrorCode.INVALID_AUTH, message: 'Nickname is required' });
      client.disconnect();
      return;
    }

    try {
      this.logger.log(
        'handleConnection: calling ConnectConversationUseCase',
        JSON.stringify({ socketId: client.id, nickname, suggestedConversationId }),
      );
      const { userId, conversationId } = await this.connectConversationUseCase.execute({
        conversationId: suggestedConversationId,
        nickname,
      });

      client.data = { userId, nickname, conversationId };
      this.logger.log('handleConnection: connected, joining room', JSON.stringify({ socketId: client.id, userId, nickname, conversationId }));
      client.join(conversationId);
      client.to(conversationId).emit(ConversationEvent.JOIN, {
        data: { nickname, conversationId },
        timestamp: new Date(),
      } satisfies InputPort<ConnectedInConversationDTO>);
    } catch (error) {
      const code = error instanceof ConversationError ? error.code : ErrorCode.INTERNAL_ERROR;
      const message = error instanceof ConversationError ? error.message : 'Internal Server Error';
      this.logger.error('handleConnection: error, disconnecting client', JSON.stringify({ socketId: client.id, error: (error as Error).message }));
      client.emit('error', { code, message });
      client.disconnect();
    }
  }

  async handleDisconnect(client: AppSocket): Promise<void> {
    this.logger.log('handleDisconnect: client disconnecting', JSON.stringify({ socketId: client.id, data: client.data }));
    const { userId, nickname, conversationId } = client.data;
    if (!userId || !nickname || !conversationId) {
      this.logger.warn('handleDisconnect: incomplete client data, skipping cleanup', JSON.stringify({ socketId: client.id }));
      return;
    }

    try {
      this.logger.log('handleDisconnect: calling LeaveConversationUseCase', JSON.stringify({ socketId: client.id, nickname, conversationId }));
      await this.leaveConversationUseCase.execute({ nickname, conversationId });

      client.leave(conversationId);
      client
        .to(conversationId)
        .emit(ConversationEvent.LEAVE, { data: { nickname, conversationId }, timestamp: new Date() } satisfies InputPort<LeftConversationDTO>);
      this.logger.log('handleDisconnect: cleanup complete', JSON.stringify({ socketId: client.id, nickname, conversationId }));
    } catch (error) {
      this.logger.error(
        'handleDisconnect: error during cleanup',
        JSON.stringify({ socketId: client.id, nickname, conversationId, error: (error as Error).message }),
      );
    }
  }
}
