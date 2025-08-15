import { ConversationEvent } from '@/infra/events/conversation/types';
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
    socket.to(data.conversationId).emit(ConversationEvent.JOIN, data);
  }

  sendMessage(socket: Socket, data: ConversationMessageServiceDTO): void {
    socket.to(data.conversationId).emit(ConversationEvent.MESSAGE, data);
  }

  leave(socket: Socket, data: ConversationLeaveServiceDTO): void {
    socket.leave(data.conversationId);
    socket.to(data.conversationId).emit(ConversationEvent.LEAVE, data);
  }
}
