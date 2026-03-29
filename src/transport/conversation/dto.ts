import { Message } from '@/domain/conversation/interfaces';
import { User } from '@/domain/user.interface';
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
