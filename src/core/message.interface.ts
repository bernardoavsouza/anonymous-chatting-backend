import { IsString, IsUUID } from 'class-validator';
import { Conversation } from './conversation.interface';
import { User } from './user.interface';

export class Message {
  @IsString()
  content: string;

  @IsUUID()
  conversationId: Conversation['id'];

  @IsUUID()
  senderId: User['id'];
}
