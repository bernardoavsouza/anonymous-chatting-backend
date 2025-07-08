import { InputPort } from '@/core/ports.interfaces';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import {
  ConversationJoinInputDTO,
  ConversationLeaveInputDTO,
  ConversationMessageInputDTO,
} from './dto';
import { ConversationEvent } from './types';

@WebSocketGateway()
export class ConversationGateway {
  @SubscribeMessage(ConversationEvent.MESSAGE)
  handleMessage(
    @MessageBody()
    input: InputPort<ConversationMessageInputDTO>,

    @ConnectedSocket() client: Socket,
  ): void {
    client
      .to(input.data.conversationId)
      .emit(ConversationEvent.MESSAGE, input.data);
  }

  @SubscribeMessage(ConversationEvent.JOIN)
  handleJoin(
    @MessageBody()
    input: InputPort<ConversationJoinInputDTO>,
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(input.data.conversationId);
  }

  @SubscribeMessage(ConversationEvent.LEAVE)
  handleLeave(
    @MessageBody()
    input: InputPort<ConversationLeaveInputDTO>,
    @ConnectedSocket() client: Socket,
  ): void {
    client.leave(input.data.conversationId);
  }
}
