import { ErrorCode } from '@/transport/errors/codes';
import { ConversationError } from '@/transport/errors/conversation.error';
import type { AppSocket } from '@/transport/types';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch()
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<AppSocket>();

    if (exception instanceof ConversationError) {
      client.emit('error', { code: exception.code, message: exception.message });
    } else if (exception instanceof WsException) {
      client.emit('error', { code: ErrorCode.VALIDATION_ERROR, message: exception.message });
    } else if (Array.isArray(exception)) {
      client.emit('error', { code: ErrorCode.VALIDATION_ERROR, message: 'Validation failed' });
    } else {
      client.emit('error', { code: ErrorCode.INTERNAL_ERROR, message: 'Internal Server Error' });
    }
  }
}
