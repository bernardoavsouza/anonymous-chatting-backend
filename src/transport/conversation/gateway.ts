import { JoinConversationUseCase } from '@/domain/conversation/usecases/join.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/usecases/send-message.usecase';
import { WsBody } from '@/transport/decorators/ws-body';
import { BaseWebSocketGateway } from '@/transport/decorators/ws-gateway';
import type { InputPort } from '@/transport/ports';
import { ConnectedSocket, SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ConversationJoinInputDTO, ConversationLeaveInputDTO, ConversationMessageInputDTO } from './dto';
import { ConversationEvent } from './types';

@BaseWebSocketGateway()
export class ConversationGateway {
  constructor(
    private readonly joinUseCase: JoinConversationUseCase,
    private readonly leaveUseCase: LeaveConversationUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {}

  @SubscribeMessage(ConversationEvent.JOIN)
  async handleJoin(@WsBody(ConversationJoinInputDTO) input: InputPort<ConversationJoinInputDTO>, @ConnectedSocket() client: Socket): Promise<void> {
    await this.joinUseCase.execute({ socket: client, ...input.data });
  }

  @SubscribeMessage(ConversationEvent.MESSAGE)
  async handleMessage(
    @WsBody(ConversationMessageInputDTO) input: InputPort<ConversationMessageInputDTO>,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    if (!client.rooms.has(input.data.conversationId)) return;

    await this.sendMessageUseCase.execute({ socket: client, ...input.data });
  }

  @SubscribeMessage(ConversationEvent.LEAVE)
  async handleLeave(
    @WsBody(ConversationLeaveInputDTO) input: InputPort<ConversationLeaveInputDTO>,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.leaveUseCase.execute({ socket: client, ...input.data });
  }
}
