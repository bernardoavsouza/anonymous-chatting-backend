import { AppController } from '@/app.controller';
import { RedisModule } from '@/datasource/redis/module';
import { GatewaysModule } from '@/transport/module';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import configs from './config/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configs],
    }),
    GatewaysModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
