import { Message } from '@/domain/conversation/interfaces';
import { IsUUID } from 'class-validator';

export class ConversationMessageInputDTO extends Message {}

export class ConversationLeaveInputDTO {
  @IsUUID()
  conversationId: Message['conversationId'];
}
