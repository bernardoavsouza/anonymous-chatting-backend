import { RedisDatasource } from '@/datasource/redis/datasource';
import { ConversationService } from '@/domain/conversation/service';
import { BaseWebSocketGateway } from '@/transport/decorators/ws-gateway';
import { InputPort } from '@/transport/ports';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import {
  ConversationJoinInputDTO,
  ConversationLeaveInputDTO,
  ConversationMessageInputDTO,
} from './dto';
import { ConversationEvent } from './types';

@BaseWebSocketGateway()
export class ConversationGateway {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly redisService: RedisDatasource,
  ) {}

  @SubscribeMessage(ConversationEvent.JOIN)
  handleJoin(
    @MessageBody()
    input: InputPort<ConversationJoinInputDTO>,
    @ConnectedSocket() client: Socket,
  ): void {
    this.conversationService.join(client, input.data);
    this.redisService.upsertDetails({
      conversationId: input.data.conversationId,
      userId: input.data.userId,
    });
  }

  @SubscribeMessage(ConversationEvent.MESSAGE)
  async handleMessage(
    @MessageBody()
    input: InputPort<ConversationMessageInputDTO>,

    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    if (!client.rooms.has(input.data.conversationId)) return;

    this.conversationService.sendMessage(client, input.data);
    await this.redisService.appendMessage(input.data);
  }

  @SubscribeMessage(ConversationEvent.LEAVE)
  async handleLeave(
    @MessageBody()
    input: InputPort<ConversationLeaveInputDTO>,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.conversationService.leave(client, input.data);

    if (!client.rooms.has(input.data.conversationId)) {
      await this.redisService.eraseConversation(input.data.conversationId);
    }
  }
}
