import { ConversationModule } from '@/domain/conversation/module';
import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { ConversationGateway } from './conversation/gateway';

@Module({
  imports: [ConversationModule],
  providers: [AppGateway, ConversationGateway],
})
export class TransportModule {}
