import type { Conversation, Message } from '@/domain/conversation/interfaces';
import type { User } from '@/domain/interfaces';
import { randomUUID } from 'crypto';

export const dummyTimestamp = '2025-07-08T14:24:35.407Z';
export const dummyDate = new Date(dummyTimestamp);

export const dummyUsers: [User, User] = [
  {
    id: randomUUID(),
    nickname: 'dummy nickname 1',
  },
  {
    id: randomUUID(),
    nickname: 'dummy nickname 2',
  },
];

const conversationId = randomUUID();

export const dummyMessage: Message = {
  content: 'dummy message',
  conversationId,
  nickname: dummyUsers[0].nickname,
  createdAt: dummyDate,
};

export const dummyConversation: Conversation = {
  id: conversationId,
  users: [...dummyUsers.map((user) => user.id)],
  createdAt: dummyDate,
};
