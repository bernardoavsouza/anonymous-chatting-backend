import { RedisModule } from '@/datasource/redis/module';
import { ConnectConversationUseCase } from '@/domain/conversation/usecases/connect.usecase';
import { JoinConversationUseCase } from '@/domain/conversation/usecases/join.usecase';
import { LeaveConversationUseCase } from '@/domain/conversation/usecases/leave.usecase';
import { SendMessageUseCase } from '@/domain/conversation/usecases/send-message.usecase';
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
