import { io } from 'socket.io-client';
import dotenv from 'dotenv';

dotenv.config();
const host = process.env.host || 'localhost';
const port = process.env.port || '3000';
const wsServer = io(`${host}:${port}`);

export { wsServer };
