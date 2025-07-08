import { Transform } from 'class-transformer';
import { IsDate, IsUUID } from 'class-validator';

export class Conversation {
  @IsUUID()
  id: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  createdAt: Date;
}
