import { RedisModule } from '@/datasource/redis/module';
import { ConnectConversationUseCase } from '@/domain/conversation/connect.usecase';
import { JoinConversationUseCase } from '@/domain/conversation/join.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/send-message.usecase';
import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { ConversationGateway } from './conversation/gateway';

const conversationUseCases = [ConnectConversationUseCase, JoinConversationUseCase, LeaveConversationUseCase, SendMessageUseCase];
const gateways = [AppGateway, ConversationGateway];

@Module({
  imports: [RedisModule],
  providers: [...gateways, ...conversationUseCases],
})
export class GatewaysModule {}
