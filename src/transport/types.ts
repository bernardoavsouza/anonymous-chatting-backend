import type { Conversation } from '@/domain/conversation/interfaces';
import type { User } from '@/domain/interfaces';
import type { Socket } from 'socket.io';

export type AppSocket = Omit<Socket, 'handshake' | 'data'> & {
  handshake: Omit<Socket['handshake'], 'auth'> & {
    auth: {
      nickname: User['nickname'];
      conversationId?: Conversation['id'];
    };
  };
  data: {
    userId?: User['id'];
    nickname?: User['nickname'];
    conversationId?: Conversation['id'];
  };
};

export class ConnectedInConversationDTO {
  nickname: User['nickname'];
  conversationId: Conversation['id'];
}

export class LeftConversationDTO {
  conversationId: Conversation['id'];
  nickname: User['nickname'];
}
