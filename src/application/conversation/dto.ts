import type { Conversation } from '@/core/conversation.interface';
import { Message } from '@/core/message.interface';
import type { User } from '@/core/user.interface';

export class ConversationJoinServiceDTO {
  conversationId: Conversation['id'];
  user: User;
}

export class ConversationMessageServiceDTO extends Message {}

export class ConversationLeaveServiceDTO {
  conversationId: Conversation['id'];
  user: User;
}
