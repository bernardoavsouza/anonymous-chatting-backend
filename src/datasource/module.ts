import { Module } from '@nestjs/common';
import { RedisDatasource } from './redis/datasource';

@Module({
  providers: [RedisDatasource],
  exports: [RedisDatasource],
})
export class DatasourceModule {}
