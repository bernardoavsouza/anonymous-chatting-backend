import { IsString, IsUUID } from 'class-validator';

export class User {
  @IsUUID()
  id: string;

  @IsString()
  nickname: string;
}

export interface UseCase<TInput, TOutput = void> {
  execute(input: TInput): Promise<TOutput>;
}
