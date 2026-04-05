import { ConversationEvent } from '@/transport/conversation/types';
import { InputPort } from '@/transport/ports';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UseCase } from '../../interfaces';
import { SendMessageDTO } from '../dto';

type SendMessageInput = { socket: Socket } & SendMessageDTO;

@Injectable()
export class SendMessageUseCase implements UseCase<SendMessageInput> {
  async execute({ socket, ...data }: SendMessageInput): Promise<void> {
    socket.to(data.conversationId).emit(ConversationEvent.MESSAGE, {
      data,
      timestamp: new Date(),
    } satisfies InputPort<SendMessageDTO>);
  }
}
