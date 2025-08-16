import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './service';

@Module({
  imports: [ConfigModule],
  providers: [RedisService],
})
export class RedisModule {}
