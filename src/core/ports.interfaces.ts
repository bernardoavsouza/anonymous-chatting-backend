import { Transform } from 'class-transformer';
import { IsDate, ValidateNested } from 'class-validator';

export class InputPort<T> {
  @ValidateNested()
  data: T;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  timestamp: Date;
}
