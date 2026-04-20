import type { Conversation } from '@/domain/conversation/interfaces';
import { Message } from '@/domain/conversation/interfaces';
import type { User } from '@/domain/interfaces';

export class ConnectConversationInputDTO {
  conversationId?: Conversation['id'];
  nickname: User['nickname'];
}

export class ConnectConversationOutputDTO {
  conversationId: Conversation['id'];
  userId: User['id'];
}

export class SendMessageDTO extends Message {}

export class LeaveConversationDTO {
  conversationId: Conversation['id'];
  nickname: User['nickname'];
}
