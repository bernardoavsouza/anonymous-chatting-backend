import type { Socket } from 'socket.io';
import type { WsServer } from '../..';

export abstract class BaseController {
  abstract onEvent(socket: Socket): void;

  load(wsServer: WsServer): void {
    wsServer.connection.on('connection', (socket) => this.onEvent(socket));
  }
}
