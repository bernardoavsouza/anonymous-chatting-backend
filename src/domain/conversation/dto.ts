import type { Conversation } from '@/domain/conversation/interfaces';
import { Message } from '@/domain/conversation/interfaces';
import type { User } from '@/domain/user.interface';

export class ConversationJoinServiceDTO {
  conversationId: Conversation['id'];
  userId: User['id'];
}

export class ConversationMessageServiceDTO extends Message {}

export class ConversationLeaveServiceDTO {
  conversationId: Conversation['id'];
  userId: User['id'];
}
