import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/usecases/send-message.usecase';
import { WsBody } from '@/transport/decorators/ws-body';
import { BaseWebSocketGateway } from '@/transport/decorators/ws-gateway';
import type { InputPort } from '@/transport/ports';
import { ConnectedSocket, SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ConversationLeaveInputDTO, ConversationMessageInputDTO } from './dto';
import { ConversationEvent } from './types';

@BaseWebSocketGateway()
export class ConversationGateway {
  constructor(
    private readonly leaveUseCase: LeaveConversationUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {}

  @SubscribeMessage(ConversationEvent.MESSAGE)
  async handleMessage(
    @WsBody(ConversationMessageInputDTO) input: InputPort<ConversationMessageInputDTO>,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    if (!client.rooms.has(input.data.conversationId)) return;
    await this.sendMessageUseCase.execute(input.data);

    client
      .to(input.data.conversationId)
      .emit(ConversationEvent.MESSAGE, { data: input.data, timestamp: new Date() } satisfies InputPort<ConversationMessageInputDTO>);
  }

  @SubscribeMessage(ConversationEvent.LEAVE)
  async handleLeave(
    @WsBody(ConversationLeaveInputDTO) input: InputPort<ConversationLeaveInputDTO>,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.leaveUseCase.execute(input.data);

    client.leave(input.data.conversationId);
    client
      .to(input.data.conversationId)
      .emit(ConversationEvent.LEAVE, { data: input.data, timestamp: new Date() } satisfies InputPort<ConversationLeaveInputDTO>);
  }
}
