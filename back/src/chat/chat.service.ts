import { Injectable } from '@nestjs/common';
import { SocketService } from 'src/socket/socket.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendChatDto } from './dto/send-chat.dto';
import { AddReactionDto } from './dto/add-reaction.dto';
import { RemoveReactionDto } from './dto/remove-reaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketService: SocketService,
  ) {}

  async createConversation({
    createConversationDto: { recipientId },
    userId,
  }: {
    createConversationDto: CreateConversationDto;
    userId: string;
  }) {
    try {
      const existingRecipient = await this.prisma.user.findUnique({
        where: {
          id: recipientId,
        },
      });
      if (!existingRecipient) {
        throw new Error("Le destinataire sélectionné n'existe pas.");
      }

      const existingUser = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!existingUser) {
        throw new Error("L'utilisateur n'existe pas.");
      }

      // Vérification si une conversation existe déjà entre les deux utilisateurs
      const createdConversation = await this.prisma.conversation.create({
        data: {
          participants: {
            connect: [
              {
                id: existingUser.id,
              },
              {
                id: existingRecipient.id,
              },
            ],
          },
        },
      });

      return {
        error: false,
        conversationId: createdConversation.id,
        message: 'La conversation a bien été créée.',
      };
    } catch (error) {
      console.error(error);
      return {
        error: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message,
      };
    }
  }

  async sendChat({
    sendChatDto,
    conversationId,
    senderId,
  }: {
    sendChatDto: SendChatDto;
    conversationId: string;
    senderId: string;
  }) {
    try {
      const existingConversation = await this.prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
      });
      if (!existingConversation) {
        throw new Error("La conversation n'existe pas.");
      }

      const existingUser = await this.prisma.user.findUnique({
        where: {
          id: senderId,
        },
      });
      if (!existingUser) {
        throw new Error("L'utilisateur n'existe pas.");
      }

      const updatedConversation = await this.prisma.conversation.update({
        where: {
          id: existingConversation.id,
        },
        data: {
          messages: {
            create: {
              content: sendChatDto.content,
              sender: {
                connect: {
                  id: existingUser.id,
                },
              },
            },
          },
        },
        select: {
          id: true,
          messages: {
            select: {
              content: true,
              id: true,
              sender: {
                select: {
                  id: true,
                  username: true,
                  messageColor: true,
                },
              },
              reactions: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      // Envoi d'une notification à l'utilisateur ayant reçu le message
      this.socketService.server
        // .to(updatedConversation.id)
        .emit('send-chat-update', updatedConversation.messages);
      console.log(updatedConversation);

      return {
        error: false,
        message: 'Votre message a bien été envoyé.',
      };
    } catch (error) {
      console.error(error);
      return {
        error: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message,
      };
    }
  }

  async getConversations({ userId }: { userId: string }) {
    const conversationsFromUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        conversations: {
          select: {
            id: true,
            updatedAt: true,
            participants: {
              select: {
                id: true,
                username: true,
                messageColor: true,
              },
            },
            messages: {
              select: {
                content: true,
                id: true,
                sender: {
                  select: {
                    id: true,
                    username: true,
                    messageColor: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });
    if (!conversationsFromUser) {
      throw new Error("L'utilisateur n'existe pas.");
    }

    return conversationsFromUser;
  }

  async getConversation({
    userId,
    conversationId,
  }: {
    userId: string;
    conversationId: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      throw new Error("L'utilisateur n'existe pas.");
    }

    const conversation = await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        id: true,
        updatedAt: true,
        participants: {
          select: {
            id: true,
            username: true,
            messageColor: true,
          },
        },
        messages: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                id: true,
                username: true,
                messageColor: true,
              },
            },
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
    if (!conversation) {
      throw new Error("Cette conversation n'existe pas.");
    }

    return conversation;
  }

  async addReaction({
    messageId,
    userId,
    addReactionDto,
  }: {
    messageId: string;
    userId: string;
    addReactionDto: AddReactionDto;
  }) {
    try {
      const existingMessage = await this.prisma.message.findUnique({
        where: {
          id: messageId,
        },
      });
      if (!existingMessage) {
        throw new Error("Le message n'existe pas.");
      }

      const existingUser = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!existingUser) {
        throw new Error("L'utilisateur n'existe pas.");
      }

      // Vérifier si la réaction existe déjà
      const existingReaction = await this.prisma.reaction.findUnique({
        where: {
          userId_messageId_emoji: {
            userId: userId,
            messageId: messageId,
            emoji: addReactionDto.emoji,
          },
        },
      });

      if (existingReaction) {
        throw new Error('Vous avez déjà ajouté cette réaction à ce message.');
      }

      // Créer la réaction
      await this.prisma.reaction.create({
        data: {
          emoji: addReactionDto.emoji,
          user: {
            connect: {
              id: userId,
            },
          },
          message: {
            connect: {
              id: messageId,
            },
          },
        },
      });

      // Récupérer le message mis à jour avec toutes les réactions
      const updatedMessage = await this.prisma.message.findUnique({
        where: {
          id: messageId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              messageColor: true,
            },
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
      });

      // Émettre la mise à jour via WebSocket
      this.socketService.server.emit('reaction-update', {
        messageId,
        message: updatedMessage,
      });

      return {
        error: false,
        message: 'Réaction ajoutée avec succès.',
      };
    } catch (error) {
      console.error(error);
      return {
        error: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message,
      };
    }
  }

  async removeReaction({
    messageId,
    userId,
    removeReactionDto,
  }: {
    messageId: string;
    userId: string;
    removeReactionDto: RemoveReactionDto;
  }) {
    try {
      const existingMessage = await this.prisma.message.findUnique({
        where: {
          id: messageId,
        },
      });
      if (!existingMessage) {
        throw new Error("Le message n'existe pas.");
      }

      const existingUser = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!existingUser) {
        throw new Error("L'utilisateur n'existe pas.");
      }

      // Vérifier si la réaction existe
      const existingReaction = await this.prisma.reaction.findUnique({
        where: {
          userId_messageId_emoji: {
            userId: userId,
            messageId: messageId,
            emoji: removeReactionDto.emoji,
          },
        },
      });

      if (!existingReaction) {
        throw new Error("Cette réaction n'existe pas.");
      }

      // Supprimer la réaction
      await this.prisma.reaction.delete({
        where: {
          id: existingReaction.id,
        },
      });

      // Récupérer le message mis à jour avec toutes les réactions
      const updatedMessage = await this.prisma.message.findUnique({
        where: {
          id: messageId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              messageColor: true,
            },
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
      });

      // Émettre la mise à jour via WebSocket
      this.socketService.server.emit('reaction-update', {
        messageId,
        message: updatedMessage,
      });

      return {
        error: false,
        message: 'Réaction supprimée avec succès.',
      };
    } catch (error) {
      console.error(error);
      return {
        error: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message,
      };
    }
  }
}
