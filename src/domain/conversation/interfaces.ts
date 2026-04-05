import { Transform } from 'class-transformer';
import { IsDate, IsString, IsUUID, ValidateNested } from 'class-validator';
import { User } from '../interfaces';

export class Conversation {
  @IsUUID()
  id: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  createdAt: Date;

  @ValidateNested()
  users: User['id'][];
}

export class ConversationDetails {
  @IsUUID()
  conversationId: Conversation['id'];

  @ValidateNested()
  users: User['id'][];

  @IsDate()
  @Transform(({ value }) => new Date(value))
  createdAt: Date;
}

export class Message {
  @IsString()
  content: string;

  @IsUUID()
  conversationId: Conversation['id'];

  @IsUUID()
  senderId: User['id'];
}
