import { Server } from 'socket.io';

export class SocketService {
  public server: Server;

  emitToConversation(conversationId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(`conversation-${conversationId}`).emit(event, data);
    }
  }
}
