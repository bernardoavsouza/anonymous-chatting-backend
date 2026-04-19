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
    conversationId?: Conversation['id'];
  };
};
