import { RedisDatasource } from '@/datasource/redis/datasource';
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../interfaces';
import { SendMessageDTO } from '../dto';

@Injectable()
export class SendMessageUseCase implements UseCase<SendMessageDTO> {
  constructor(private readonly redis: RedisDatasource) {}

  async execute(data: SendMessageDTO): Promise<void> {
    await this.redis.appendMessage(data);
  }
}
