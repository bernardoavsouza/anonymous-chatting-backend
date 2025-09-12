import { Transform } from 'class-transformer';
import { IsDate, IsUUID, ValidateNested } from 'class-validator';
import { User } from './user.interface';

export class Conversation {
  @IsUUID()
  id: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  createdAt: Date;

  @ValidateNested()
  users: User['id'][];
}
