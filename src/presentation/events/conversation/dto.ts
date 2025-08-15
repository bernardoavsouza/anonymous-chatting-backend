import { Message } from '@/core/message.interface';
import { User } from '@/core/user.interface';
import { plainToClass, Transform } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

export class ConversationMessageInputDTO extends Message {}
export class ConversationJoinInputDTO {
  @ValidateNested()
  @Transform(({ value }) => plainToClass(User, value))
  user: User;

  @IsUUID()
  conversationId: Message['conversationId'];
}

export class ConversationLeaveInputDTO {
  @ValidateNested()
  @Transform(({ value }) => plainToClass(User, value))
  user: User;

  @IsUUID()
  conversationId: Message['conversationId'];
}
