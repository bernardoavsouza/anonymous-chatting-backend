import { Message } from '@/core/message.interface';
import { User } from '@/core/user.interface';
import { ValidateNested } from 'class-validator';

export class ConversationMessageInputDTO extends Message {}
export class ConversationJoinInputDTO {
  @ValidateNested()
  user: User;

  @ValidateNested()
  conversationId: Message['conversationId'];
}

export class ConversationLeaveInputDTO {
  @ValidateNested()
  user: User;

  @ValidateNested()
  conversationId: Message['conversationId'];
}
