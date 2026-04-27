import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/usecases/send-message.usecase';
import { WsBody } from '@/transport/decorators/ws-body';
import { BaseWebSocketGateway } from '@/transport/decorators/ws-gateway';
import { ErrorCode } from '@/transport/errors/codes';
import { ConversationError } from '@/transport/errors/conversation.error';
import type { InputPort } from '@/transport/ports';
import type { AppSocket } from '@/transport/types';
import { Logger } from '@nestjs/common';
import { ConnectedSocket, SubscribeMessage } from '@nestjs/websockets';
import { ConversationLeaveInputDTO, ConversationMessageInputDTO } from './dto';
import { ConversationEvent } from './types';

@BaseWebSocketGateway()
export class ConversationGateway {
  private readonly logger = new Logger(ConversationGateway.name);

  constructor(
    private readonly leaveUseCase: LeaveConversationUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {}

  @SubscribeMessage(ConversationEvent.MESSAGE)
  async handleMessage(
    @WsBody(ConversationMessageInputDTO) input: InputPort<ConversationMessageInputDTO>,
    @ConnectedSocket() client: AppSocket,
  ): Promise<void> {
    this.logger.log(
      'handleMessage: received',
      JSON.stringify({ socketId: client.id, conversationId: input.data.conversationId, nickname: input.data.nickname }),
    );

    if (!client.rooms.has(input.data.conversationId)) {
      this.logger.warn('handleMessage: client not in room', JSON.stringify({ socketId: client.id, conversationId: input.data.conversationId }));
      client.emit('error', { code: ErrorCode.NOT_IN_ROOM, message: 'Not in this conversation' });
      return;
    }

    try {
      this.logger.log(
        'handleMessage: calling SendMessageUseCase',
        JSON.stringify({ socketId: client.id, conversationId: input.data.conversationId }),
      );
      await this.sendMessageUseCase.execute(input.data);

      client
        .to(input.data.conversationId)
        .emit(ConversationEvent.MESSAGE, { data: input.data, timestamp: new Date() } satisfies InputPort<ConversationMessageInputDTO>);
      this.logger.log('handleMessage: message broadcast to room', JSON.stringify({ socketId: client.id, conversationId: input.data.conversationId }));
    } catch (error) {
      const code = error instanceof ConversationError ? error.code : ErrorCode.INTERNAL_ERROR;
      const message = error instanceof ConversationError ? error.message : 'Internal Server Error';
      this.logger.error(
        'handleMessage: error persisting message',
        JSON.stringify({ socketId: client.id, conversationId: input.data.conversationId, error: (error as Error).message }),
      );
      client.emit('error', { code, message });
    }
  }

  @SubscribeMessage(ConversationEvent.LEAVE)
  async handleLeave(
    @WsBody(ConversationLeaveInputDTO) input: InputPort<ConversationLeaveInputDTO>,
    @ConnectedSocket() client: AppSocket,
  ): Promise<void> {
    this.logger.log('handleLeave: received', JSON.stringify({ socketId: client.id, data: client.data }));
    const { nickname, conversationId } = client.data;

    if (!nickname || !conversationId) {
      this.logger.warn('handleLeave: missing auth data, rejecting', JSON.stringify({ socketId: client.id }));
      client.emit('error', { code: ErrorCode.INVALID_AUTH, message: 'Not authenticated in a conversation' });
      return;
    }

    try {
      this.logger.log('handleLeave: calling LeaveConversationUseCase', JSON.stringify({ socketId: client.id, nickname, conversationId }));
      await this.leaveUseCase.execute({ nickname, conversationId });

      client.leave(input.data.conversationId);
      client
        .to(input.data.conversationId)
        .emit(ConversationEvent.LEAVE, { data: input.data, timestamp: new Date() } satisfies InputPort<ConversationLeaveInputDTO>);
      this.logger.log('handleLeave: left room and notified peers', JSON.stringify({ socketId: client.id, nickname, conversationId }));
    } catch (error) {
      const code = error instanceof ConversationError ? error.code : ErrorCode.INTERNAL_ERROR;
      const message = error instanceof ConversationError ? error.message : 'Internal Server Error';
      this.logger.error(
        'handleLeave: error during leave',
        JSON.stringify({ socketId: client.id, nickname, conversationId, error: (error as Error).message }),
      );
      client.emit('error', { code, message });
    }
  }
}
