export class ServerUrl {
  private static instance: ServerUrl;
  public protocol: string;
  public host: string;
  public port: number;
  public url: string;

  private constructor() {
    this.protocol = process.env.PROTOCOL || 'http';
    this.host = process.env.HOST || 'localhost';
    this.port = +(process.env.PORT || '3000');
    this.url = `${this.protocol}://${this.host}:${this.port}`;
  }

  public static getInstance(): ServerUrl {
    if (!ServerUrl.instance) {
      ServerUrl.instance = new ServerUrl();
    }
    return ServerUrl.instance;
  }
}
