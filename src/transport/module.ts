import { RedisModule } from '@/datasource/redis/module';
import { ConnectConversationUseCase } from '@/domain/conversation/connect.usecase';
import { ConversationService } from '@/domain/conversation/service';
import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { ConversationGateway } from './conversation/gateway';

@Module({
  imports: [RedisModule],
  providers: [AppGateway, ConversationGateway, ConversationService, ConnectConversationUseCase],
})
export class GatewaysModule {}
