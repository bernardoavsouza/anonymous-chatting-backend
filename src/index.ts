import { createServer } from 'http';
import dotenv from 'dotenv';
import { wsServer } from './config/servers/ws-server';
import { ServerUrl } from './config/servers/server-url';

const httpServer = createServer();
const { host: serverHost, port: serverPost } = ServerUrl.getData();
wsServer.attach(httpServer);

dotenv.config();
const host = serverHost;
const port = serverPost;

httpServer.listen(port, host);
