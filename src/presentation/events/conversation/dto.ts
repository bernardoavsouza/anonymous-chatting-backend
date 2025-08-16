import { Message } from '@/core/message.interface';
import { User } from '@/core/user.interface';
import { IsUUID } from 'class-validator';

export class ConversationMessageInputDTO extends Message {}
export class ConversationJoinInputDTO {
  @IsUUID()
  userId: User['id'];

  @IsUUID()
  conversationId: Message['conversationId'];
}

export class ConversationLeaveInputDTO {
  @IsUUID()
  userId: User['id'];

  @IsUUID()
  conversationId: Message['conversationId'];
}
