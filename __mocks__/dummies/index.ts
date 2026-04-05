import type { Conversation, Message } from '@/domain/conversation/interfaces';
import type { User } from '@/domain/interfaces';

export const dummyIds = ['a3bb189e-8bf9-4d3f-9e3b-4e2c6f1a1b2c', '7c9e6679-7425-40de-944b-e07fc1f90ae7'];

export const dummyTimestamp = '2025-07-08T14:24:35.407Z';
export const dummyDate = new Date(dummyTimestamp);

export const dummyMessage: Message = {
  content: 'dummy message',
  conversationId: dummyIds[0] as string,
  senderId: dummyIds[1] as string,
};

export const dummyUsers: [User, User] = [
  {
    id: dummyIds[1] as string,
    nickname: 'dummy nickname 1',
  },
  {
    id: dummyIds[2] as string,
    nickname: 'dummy nickname 2',
  },
];

export const dummyConversation: Conversation = {
  id: dummyIds[0] as string,
  users: dummyIds,
  createdAt: dummyDate,
};
