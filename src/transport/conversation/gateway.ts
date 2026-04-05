import { RedisDatasource } from '@/datasource/redis/datasource';
import { ConversationService } from '@/domain/conversation/service';
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
    private readonly conversationService: ConversationService,
    private readonly redisService: RedisDatasource,
  ) {}

  @SubscribeMessage(ConversationEvent.JOIN)
  handleJoin(@WsBody(ConversationJoinInputDTO) input: InputPort<ConversationJoinInputDTO>, @ConnectedSocket() client: Socket): void {
    this.conversationService.join(client, input.data);
    this.redisService.upsertDetails({
      conversationId: input.data.conversationId,
      userId: input.data.userId,
    });
  }

  @SubscribeMessage(ConversationEvent.MESSAGE)
  async handleMessage(
    @WsBody(ConversationMessageInputDTO) input: InputPort<ConversationMessageInputDTO>,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    if (!client.rooms.has(input.data.conversationId)) return;

    this.conversationService.sendMessage(client, input.data);
    await this.redisService.appendMessage(input.data);
  }

  @SubscribeMessage(ConversationEvent.LEAVE)
  async handleLeave(
    @WsBody(ConversationLeaveInputDTO) input: InputPort<ConversationLeaveInputDTO>,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.conversationService.leave(client, input.data);

    if (!client.rooms.has(input.data.conversationId)) {
      await this.redisService.eraseConversation(input.data.conversationId);
    }
  }
}
