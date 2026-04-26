import { WsExceptionFilter } from '@/transport/filters/ws-exception.filter';
import { applyDecorators, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';

export const BaseWebSocketGateway = (): ReturnType<typeof applyDecorators> =>
  applyDecorators(
    WebSocketGateway(),
    UseFilters(new WsExceptionFilter()),
    UsePipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    ),
  );
