import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { EventsModule } from '@/infra/events/module';
import { Module } from '@nestjs/common';

@Module({
  imports: [EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
