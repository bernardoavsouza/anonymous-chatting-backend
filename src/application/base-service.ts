import type { Socket } from 'socket.io';

export interface BaseService {
  execute(socket: Socket): void;
}
