import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/usecases/send-message.usecase';
import { WsBody } from '@/transport/decorators/ws-body';
import { BaseWebSocketGateway } from '@/transport/decorators/ws-gateway';
import type { InputPort } from '@/transport/ports';
import type { AppSocket } from '@/transport/types';
import { ConnectedSocket, SubscribeMessage } from '@nestjs/websockets';
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
    @ConnectedSocket() client: AppSocket,
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
    @ConnectedSocket() client: AppSocket,
  ): Promise<void> {
    const { nickname, conversationId } = client.data;

    if (!nickname || !conversationId) {
      return;
    }

    await this.leaveUseCase.execute({ nickname, conversationId });

    client.leave(input.data.conversationId);
    client
      .to(input.data.conversationId)
      .emit(ConversationEvent.LEAVE, { data: input.data, timestamp: new Date() } satisfies InputPort<ConversationLeaveInputDTO>);
  }
}
