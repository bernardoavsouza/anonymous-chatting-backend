import { IsString, IsUUID } from 'class-validator';

export class Message {
  @IsString()
  content: string;

  @IsUUID()
  conversationId: string;

  @IsUUID()
  senderId: string;
}
