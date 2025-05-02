import { Server } from 'socket.io';
import wsConfigs from './config/servers/ws';
import { PingController } from './infra/ws/events/ping.controller';

export class WsServer {
  private static instance: WsServer;
  connection: Server;

  private constructor() {
    this.connection = new Server(wsConfigs.port);
    this.startUpLog();
    this.loadEvents();
  }

  public static getInstance(): WsServer {
    if (!this.instance) {
      this.instance = new WsServer();
    }
    return this.instance;
  }

  private startUpLog(): void {
    console.log(`Socket.IO server running on port ${wsConfigs.port}`);
  }

  private loadEvents(): void {
    new PingController().load(this);
  }
}

export const wsServer = WsServer.getInstance();
