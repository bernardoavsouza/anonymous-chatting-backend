import { InputPort } from '@/core/ports.interfaces';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ConversationMessageInputDTO } from './dto';
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
}
