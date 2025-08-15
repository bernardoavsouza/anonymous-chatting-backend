import { applyDecorators } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';

export const BaseWebSocketGateway = (): ReturnType<typeof applyDecorators> =>
  applyDecorators(
    WebSocketGateway(),
    // UsePipes(
    //   new ValidationPipe({
    //     whitelist: true,
    //     transform: true,
    //     forbidNonWhitelisted: true,
    //   }),
    // ),
  );
