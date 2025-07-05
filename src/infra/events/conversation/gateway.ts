import { Message } from '@/core/message.interface';
import {
  ConnectedSocket,
  MessageBody,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class ConversationGateway {
  handleMessage(
    @MessageBody() data: Message,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.conversationId).emit('message', data);
  }
}
