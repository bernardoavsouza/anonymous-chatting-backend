import type { Socket } from 'socket.io';
import { BaseController } from '../base-controller';
import { PingService } from '../../../application/ping/ping.service';

export class PingController extends BaseController {
  override onEvent(socket: Socket): void {
    socket.on('ping', () => {
      new PingService().execute(socket);
    });
  }
}
