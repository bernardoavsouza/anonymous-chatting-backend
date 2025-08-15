import { ConversationService } from '@/application/conversation/service';
import { Module } from '@nestjs/common';
import { ConversationGateway } from './conversation/gateway';

@Module({
  providers: [ConversationGateway, ConversationService],
})
export class EventsModule {}
