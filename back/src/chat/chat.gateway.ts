import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from 'src/socket/socket.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private socketService: SocketService,
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  afterInit() {
    this.socketService.server = this.server;
  }

  async handleConnection(client: Socket) {
    try {
      // Extraire le token depuis l'auth header ou query
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.query?.token as string);

      console.log(
        'Token reçu:',
        token ? `${token.substring(0, 20)}...` : 'aucun',
      );

      if (!token || typeof token !== 'string') {
        console.log('Connexion rejetée: pas de token');
        client.disconnect();
        return;
      }

      // Vérifier le token JWT
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = this.jwtService.verify(token);
      console.log('Payload JWT:', payload);
      const userId = (payload as { sub: string }).sub;

      console.log('UserId extrait:', userId);

      // Récupérer les conversations de l'utilisateur
      const userConversations = await this.prismaService.conversation.findMany({
        where: {
          participants: {
            some: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      // Faire rejoindre l'utilisateur à toutes ses conversations
      for (const conversation of userConversations) {
        await client.join(`conversation-${conversation.id}`);
      }

      console.log(
        `Utilisateur ${userId} connecté et a rejoint ${userConversations.length} conversations`,
      );
    } catch (error) {
      console.error('Erreur lors de la connexion WebSocket:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client déconnecté:', client.id);
  }

  @SubscribeMessage('join-conversation')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    await client.join(`conversation-${data.conversationId}`);
    console.log(
      `Client ${client.id} a rejoint la conversation ${data.conversationId}`,
    );
  }

  @SubscribeMessage('test')
  sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: string,
  ) {
    console.log(message);
    client.emit('test', {
      message: 'Hello from the server',
      data: message,
    });
  }
}
