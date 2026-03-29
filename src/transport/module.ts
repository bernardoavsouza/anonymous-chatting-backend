import { RedisModule } from '@/datasource/redis/module';
import { ConversationService } from '@/domain/conversation/service';
import { Module } from '@nestjs/common';
import { ConversationGateway } from './conversation/gateway';

@Module({
  imports: [RedisModule],
  providers: [ConversationGateway, ConversationService],
})
export class GatewaysModule {}
