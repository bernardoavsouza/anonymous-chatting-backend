import { createServer } from 'http';
import dotenv from 'dotenv';
import { wsServer } from './config/server';

const httpServer = createServer();
wsServer.attach(httpServer);

dotenv.config();
const host = process.env.host || 'localhost';
const port = +(process.env.port || '3000');

httpServer.listen(port, host);
