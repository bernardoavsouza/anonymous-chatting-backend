import { ConversationEvent } from '@/presentation/events/conversation/types';
import { InputPort } from '@/presentation/ports';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import {
  ConversationJoinServiceDTO,
  ConversationLeaveServiceDTO,
  ConversationMessageServiceDTO,
} from './dto';

@Injectable()
export class ConversationService {
  join(socket: Socket, data: ConversationJoinServiceDTO): void {
    socket.join(data.conversationId);
    socket.to(data.conversationId).emit(ConversationEvent.JOIN, {
      data,
      timestamp: new Date(),
    } satisfies InputPort<ConversationJoinServiceDTO>);
  }

  sendMessage(socket: Socket, data: ConversationMessageServiceDTO): void {
    socket.to(data.conversationId).emit(ConversationEvent.MESSAGE, {
      data,
      timestamp: new Date(),
    } satisfies InputPort<ConversationMessageServiceDTO>);
  }

  leave(socket: Socket, data: ConversationLeaveServiceDTO): void {
    socket.leave(data.conversationId);
    socket.to(data.conversationId).emit(ConversationEvent.LEAVE, {
      data,
      timestamp: new Date(),
    } satisfies InputPort<ConversationLeaveServiceDTO>);
  }
}
