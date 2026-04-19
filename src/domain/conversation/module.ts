import { DatasourceModule } from '@/datasource/module';
import { Module } from '@nestjs/common';
import { ConnectConversationUseCase } from './usecases/connect.usecase';
import { LeaveConversationUseCase } from './usecases/leave.usecase';
import { SendMessageUseCase } from './usecases/send-message.usecase';

const useCases = [ConnectConversationUseCase, LeaveConversationUseCase, SendMessageUseCase];

@Module({
  imports: [DatasourceModule],
  providers: useCases,
  exports: useCases,
})
export class ConversationModule {}
