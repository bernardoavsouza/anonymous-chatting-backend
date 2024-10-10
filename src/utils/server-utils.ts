import { TServerData } from '../types/utils/server.types';

export class ServerUrl {
  private static protocol: string = process.env.PROTOCOL || 'http';
  private static host: string = process.env.HOST || 'localhost';
  private static port: number = +(process.env.PORT || '3000');
  private static url: string = `${this.protocol}://${this.host}:${this.port}`;

  public static getServerData(): TServerData {
    return {
      protocol: this.protocol,
      host: this.host,
      port: this.port,
      url: this.url,
    };
  }
}
