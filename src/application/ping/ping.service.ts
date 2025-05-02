import type { Socket } from 'socket.io';
import type { BaseService } from '../base-service';

export class PingService implements BaseService {
  execute(socket: Socket): void {
    socket.emit('ping', 'pong');
  }
}
