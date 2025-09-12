import { ConversationService } from '@/application/conversation/service';
import { RedisService } from '@/application/redis/service';
import { BaseWebSocketGateway } from '@/presentation/decorators/ws-gateway';
import { InputPort } from '@/presentation/ports';
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
    private readonly redisService: RedisService,
  ) {}

  @SubscribeMessage(ConversationEvent.JOIN)
  handleJoin(
    @MessageBody()
    input: InputPort<ConversationJoinInputDTO>,
    @ConnectedSocket() client: Socket,
  ): void {
    this.conversationService.join(client, input.data);
    this.redisService.appendDetails({
      conversationId: input.data.conversationId,
      userId: input.data.userId,
    });
  }

  @SubscribeMessage(ConversationEvent.MESSAGE)
  handleMessage(
    @MessageBody()
    input: InputPort<ConversationMessageInputDTO>,

    @ConnectedSocket() client: Socket,
  ): void {
    if (!client.rooms.has(input.data.conversationId)) return;

    this.conversationService.sendMessage(client, input.data);
    this.redisService.appendMessage(input.data);
  }

  @SubscribeMessage(ConversationEvent.LEAVE)
  handleLeave(
    @MessageBody()
    input: InputPort<ConversationLeaveInputDTO>,
    @ConnectedSocket() client: Socket,
  ): void {
    this.conversationService.leave(client, input.data);

    if (!client.rooms.has(input.data.conversationId)) {
      this.redisService.eraseConversation(input.data.conversationId);
    }
  }
}
