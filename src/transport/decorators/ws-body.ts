import { InputPortPipe } from '@/transport/pipes/input-port.pipe';
import { MessageBody } from '@nestjs/websockets';

type ClassConstructor<T> = new (...args: unknown[]) => T;

export const WsBody = <T extends object>(dto: ClassConstructor<T>): ParameterDecorator => MessageBody(new InputPortPipe(dto));
