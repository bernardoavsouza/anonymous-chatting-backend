import { ConnectConversationUseCase } from '@/domain/conversation/usecases/connect.usecase';
import { DisconnectConversationUseCase } from '@/domain/conversation/usecases/disconnect.usecase';
import { Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly connectConversationUseCase: ConnectConversationUseCase,
    private readonly disconnectConversationUseCase: DisconnectConversationUseCase,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const { nickname, conversationId } = client.handshake.auth;
    client.data = await this.connectConversationUseCase.execute({ nickname, conversationId });
  }

  async handleDisconnect(client: Socket): Promise<void> {
    await this.disconnectConversationUseCase.execute(client);
  }
}
