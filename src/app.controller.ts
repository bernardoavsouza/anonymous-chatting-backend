import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHello(): Record<string, string> {
    return {
      status: 'ok',
    };
  }
}
