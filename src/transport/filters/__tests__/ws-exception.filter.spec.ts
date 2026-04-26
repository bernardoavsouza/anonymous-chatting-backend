import { ErrorCode } from '@/transport/errors/codes';
import { ConversationError } from '@/transport/errors/conversation.error';
import { WsExceptionFilter } from '@/transport/filters/ws-exception.filter';
import type { AppSocket } from '@/transport/types';
import type { ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { MockedSocket } from '~/socket.io';

const makeHost = (client: AppSocket): ArgumentsHost =>
  ({
    switchToWs: () => ({ getClient: () => client }),
  }) as unknown as ArgumentsHost;

describe('WsExceptionFilter', () => {
  let filter: WsExceptionFilter;
  let socket: AppSocket;

  beforeEach(() => {
    filter = new WsExceptionFilter();
    socket = MockedSocket();
  });

  it('should emit VALIDATION_ERROR for WsException', () => {
    filter.catch(new WsException('bad payload'), makeHost(socket));

    expect(socket.emit).toHaveBeenCalledWith('error', { code: ErrorCode.VALIDATION_ERROR, message: 'bad payload' });
  });

  it('should emit the ConversationError code and message for ConversationError', () => {
    filter.catch(new ConversationError(ErrorCode.NOT_IN_ROOM, 'not in room'), makeHost(socket));

    expect(socket.emit).toHaveBeenCalledWith('error', { code: ErrorCode.NOT_IN_ROOM, message: 'not in room' });
  });

  it('should emit VALIDATION_ERROR for class-validator Array exception', () => {
    filter.catch([], makeHost(socket));

    expect(socket.emit).toHaveBeenCalledWith('error', { code: ErrorCode.VALIDATION_ERROR, message: 'Validation failed' });
  });

  it('should emit INTERNAL_ERROR for generic Error', () => {
    filter.catch(new Error('unexpected'), makeHost(socket));

    expect(socket.emit).toHaveBeenCalledWith('error', { code: ErrorCode.INTERNAL_ERROR, message: 'Internal Server Error' });
  });
});
