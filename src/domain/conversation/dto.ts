import type { Conversation } from '@/domain/conversation/interfaces';
import { Message } from '@/domain/conversation/interfaces';
import type { User } from '@/domain/interfaces';

export class ConnectConversationDTO {
  nickname: string;
  conversationId?: Conversation['id'];
}

export class ConnectConversationResultDTO {
  userId: User['id'];
  conversationId: Conversation['id'];
}

export class JoinConversationDTO {
  conversationId: Conversation['id'];
  userId: User['id'];
}

export class SendMessageDTO extends Message {}

export class LeaveConversationDTO {
  conversationId: Conversation['id'];
  userId: User['id'];
}
