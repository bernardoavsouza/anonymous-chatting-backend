import { RedisDatasource } from '@/datasource/redis/datasource';
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
    private readonly redisService: RedisDatasource,
  ) {}

  @SubscribeMessage(ConversationEvent.JOIN)
  handleJoin(@WsBody(ConversationJoinInputDTO) input: InputPort<ConversationJoinInputDTO>, @ConnectedSocket() client: Socket): void {
    this.joinUseCase.execute({ socket: client, ...input.data });
    this.redisService.upsertDetails({ conversationId: input.data.conversationId, userId: input.data.userId });
  }

  @SubscribeMessage(ConversationEvent.MESSAGE)
  async handleMessage(
    @WsBody(ConversationMessageInputDTO) input: InputPort<ConversationMessageInputDTO>,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    if (!client.rooms.has(input.data.conversationId)) return;

    this.sendMessageUseCase.execute({ socket: client, ...input.data });
    await this.redisService.appendMessage(input.data);
  }

  @SubscribeMessage(ConversationEvent.LEAVE)
  async handleLeave(
    @WsBody(ConversationLeaveInputDTO) input: InputPort<ConversationLeaveInputDTO>,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.leaveUseCase.execute({ socket: client, ...input.data });

    if (!client.rooms.has(input.data.conversationId)) {
      await this.redisService.eraseConversation(input.data.conversationId);
    }
  }
}
