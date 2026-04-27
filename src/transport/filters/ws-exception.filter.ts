import { ErrorCode } from '@/transport/errors/codes';
import { ConversationError } from '@/transport/errors/conversation.error';
import type { AppSocket } from '@/transport/types';
import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch()
export class WsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<AppSocket>();

    if (exception instanceof ConversationError) {
      this.logger.warn('ConversationError', JSON.stringify({ socketId: client.id, code: exception.code, message: exception.message }));
      client.emit('error', { code: exception.code, message: exception.message });
    } else if (exception instanceof WsException) {
      this.logger.warn('WsException (validation)', JSON.stringify({ socketId: client.id, message: exception.message }));
      client.emit('error', { code: ErrorCode.VALIDATION_ERROR, message: exception.message });
    } else if (Array.isArray(exception)) {
      this.logger.warn('class-validator errors', JSON.stringify({ socketId: client.id, count: exception.length }));
      client.emit('error', { code: ErrorCode.VALIDATION_ERROR, message: 'Validation failed' });
    } else {
      this.logger.error(
        'unknown exception',
        JSON.stringify({ socketId: client.id, error: exception instanceof Error ? exception.message : String(exception) }),
      );
      client.emit('error', { code: ErrorCode.INTERNAL_ERROR, message: 'Internal Server Error' });
    }
  }
}
