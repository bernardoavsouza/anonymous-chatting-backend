import { Message } from '@/core/message.interface';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ConversationEvent } from './types';

@WebSocketGateway()
export class ConversationGateway {
  @SubscribeMessage(ConversationEvent.MESSAGE)
  handleMessage(
    @MessageBody() data: Message,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.conversationId).emit(ConversationEvent.MESSAGE, data);
  }
}
