import { ConversationService } from '@/application/conversation/service';
import { RedisModule } from '@/application/redis/module';
import { Module } from '@nestjs/common';
import { ConversationGateway } from './conversation/gateway';

@Module({
  imports: [RedisModule],
  providers: [ConversationGateway, ConversationService],
})
export class EventsModule {}
