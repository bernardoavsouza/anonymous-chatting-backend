import { Transform } from 'class-transformer';
import { IsDate, IsObject } from 'class-validator';

export class InputPort<T> {
  @IsObject()
  data: T;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  timestamp: Date;
}
