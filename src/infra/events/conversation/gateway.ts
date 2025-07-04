import {
  ConnectedSocket,
  MessageBody,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Message } from 'src/core/message.interface';

@WebSocketGateway()
export class ConversationGateway {
  handleMessage(
    @MessageBody() data: Message,
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.conversationId).emit('message', data);
  }
}
