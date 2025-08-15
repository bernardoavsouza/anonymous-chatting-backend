import { ConversationService } from '@/application/conversation/service';
import { InputPort } from '@/core/ports.interfaces';
import { BaseWebSocketGateway } from '@/infra/decorators/ws';
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
  constructor(private readonly conversationService: ConversationService) {}

  @SubscribeMessage(ConversationEvent.JOIN)
  handleJoin(
    @MessageBody()
    input: InputPort<ConversationJoinInputDTO>,
    @ConnectedSocket() client: Socket,
  ): void {
    this.conversationService.join(client, input.data);
  }

  @SubscribeMessage(ConversationEvent.MESSAGE)
  handleMessage(
    @MessageBody()
    input: InputPort<ConversationMessageInputDTO>,

    @ConnectedSocket() client: Socket,
  ): void {
    if (!client.rooms.has(input.data.conversationId)) return;

    this.conversationService.sendMessage(client, input.data);
  }

  @SubscribeMessage(ConversationEvent.LEAVE)
  handleLeave(
    @MessageBody()
    input: InputPort<ConversationLeaveInputDTO>,
    @ConnectedSocket() client: Socket,
  ): void {
    this.conversationService.leave(client, input.data);
  }
}
