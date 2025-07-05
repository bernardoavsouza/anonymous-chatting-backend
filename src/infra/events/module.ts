import { Module } from '@nestjs/common';
import { ConversationGateway } from './conversation/gateway';

@Module({
  providers: [ConversationGateway],
})
export class EventsModule {}
