import { ConnectConversationUseCase } from '@/domain/conversation/connect.usecase';
import { Injectable } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
@WebSocketGateway()
export class AppGateway implements OnGatewayConnection {
  constructor(private readonly connectConversationUseCase: ConnectConversationUseCase) {}

  async handleConnection(client: Socket): Promise<void> {
    const { nickname, conversationId } = client.handshake.auth;
    await this.connectConversationUseCase.execute({ nickname, conversationId });
  }
}
