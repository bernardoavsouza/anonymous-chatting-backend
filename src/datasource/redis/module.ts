import { Module } from '@nestjs/common';
import { RedisDatasource } from './datasource';

@Module({
  providers: [RedisDatasource],
  exports: [RedisDatasource],
})
export class RedisModule {}
