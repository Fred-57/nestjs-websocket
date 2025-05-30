"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import {
  chatApi,
  userApi,
  Conversation,
  User,
  Message,
  WizzData,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Plus,
  Send,
  Users,
  LogOut,
  Settings,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading";
import { UserSettings } from "@/components/ui/user-settings";
import { ReactionButton } from "@/components/ui/reaction-picker";
import { MessageReactions } from "@/components/ui/message-reactions";
import { WizzButton } from "@/components/ui/wizz-button";
import { WizzEffect } from "@/components/ui/wizz-effect";
import { WizzNotification } from "@/components/ui/wizz-notification";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateConversation, setShowCreateConversation] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // États pour le wizz
  const [isWizzing, setIsWizzing] = useState(false);
  const [wizzNotification, setWizzNotification] = useState<{
    show: boolean;
    senderUsername: string;
  }>({ show: false, senderUsername: "" });

  const loadConversations = useCallback(async () => {
    try {
      const data = await chatApi.getConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const data = await userApi.getUsers();
      setUsers(data.filter((u: User) => u.id !== user?.id));
    } catch (error) {
      console.error("Error loading users:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    loadConversations();
    loadUsers();
  }, [user, router, loadConversations, loadUsers]);

  useEffect(() => {
    if (socket) {
      socket.on("send-chat-update", (newMessages: Message[]) => {
        if (selectedConversation) {
          setMessages(newMessages);
        }
      });

      socket.on(
        "reaction-update",
        (data: { messageId: string; message: Message }) => {
          if (selectedConversation) {
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === data.messageId ? data.message : msg
              )
            );
          }
        }
      );

      // Nouvel événement pour mettre à jour la liste des conversations
      socket.on(
        "conversation-list-update",
        (data: { conversationId: string; participants: string[] }) => {
          // Vérifier si l'utilisateur actuel fait partie des participants
          if (user?.id && data.participants.includes(user.id)) {
            // Recharger la liste des conversations
            loadConversations();
          }
        }
      );

      socket.on("wizz-received", (data: WizzData) => {
        if (
          selectedConversation &&
          data.conversationId === selectedConversation.id &&
          data.senderId !== user?.id
        ) {
          // Afficher la notification
          setWizzNotification({
            show: true,
            senderUsername: data.senderUsername,
          });

          // Déclencher l'animation de vibration
          setIsWizzing(true);
          setTimeout(() => {
            setIsWizzing(false);
          }, 2000);
        }
      });

      return () => {
        socket.off("send-chat-update");
        socket.off("reaction-update");
        socket.off("conversation-list-update");
        socket.off("wizz-received");
      };
    }
  }, [socket, selectedConversation, user?.id, loadConversations]);

  const loadConversation = async (conversationId: string) => {
    try {
      const conversation = await chatApi.getConversation(conversationId);
      setSelectedConversation(conversation);
      setMessages(conversation.messages || []);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const createConversation = async () => {
    if (!selectedUserId) return;

    setLoading(true);
    setError("");
    try {
      const response = await chatApi.createConversation({
        recipientId: selectedUserId,
      });
      if (!response.error) {
        await loadConversations();
        setShowCreateConversation(false);
        setSelectedUserId("");
      } else {
        setError(
          response.message || "Erreur lors de la création de la conversation"
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de la conversation";
      setError(errorMessage);
      console.error("Error creating conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      await chatApi.sendMessage(selectedConversation.id, {
        content: newMessage,
      });
      setNewMessage("");
      // Les messages seront mis à jour via Socket.IO
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!selectedConversation) return;

    try {
      await chatApi.addReaction(selectedConversation.id, messageId, { emoji });
      // Les réactions seront mises à jour via Socket.IO
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!selectedConversation) return;

    try {
      await chatApi.removeReaction(selectedConversation.id, messageId, {
        emoji,
      });
      // Les réactions seront mises à jour via Socket.IO
    } catch (error) {
      console.error("Error removing reaction:", error);
    }
  };

  const sendWizz = async () => {
    if (!selectedConversation) return;

    try {
      await chatApi.sendWizz(selectedConversation.id);
    } catch (error) {
      console.error("Error sending wizz:", error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const getConversationName = (conversation: Conversation) => {
    const otherParticipant = conversation.participants.find(
      (p) => p.id !== user?.id
    );
    return otherParticipant?.username || "Conversation";
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold">Chat</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCreateConversation(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">Connecté en tant que</p>
          <p className="font-medium">{user?.username}</p>
        </div>

        {/* Create conversation modal */}
        {showCreateConversation && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-medium mb-2">Nouvelle conversation</h3>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            >
              <option value="">Sélectionner un utilisateur</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={createConversation}
                disabled={loading || !selectedUserId}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Création...</span>
                  </div>
                ) : (
                  "Créer"
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowCreateConversation(false);
                  setSelectedUserId("");
                  setError("");
                }}
              >
                Annuler
              </Button>
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </div>
        )}

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">
              Aucune conversation
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => loadConversation(conversation.id)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {getConversationName(conversation)}
                    </p>
                    {conversation.messages &&
                      conversation.messages.length > 0 && (
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.messages[0].content}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col relative h-full">
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
              <h2 className="text-lg font-semibold">
                {getConversationName(selectedConversation)}
              </h2>
            </div>

            {/* Notification Wizz */}
            <WizzNotification
              senderUsername={wizzNotification.senderUsername}
              show={wizzNotification.show}
              onComplete={() =>
                setWizzNotification({ show: false, senderUsername: "" })
              }
            />

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <WizzEffect isWizzing={isWizzing}>
                <div className="h-full overflow-y-auto p-4 space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender.id === user?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div className="max-w-xs lg:max-w-md group">
                          <div className="flex items-end space-x-2">
                            <div
                              className={`px-4 py-2 rounded-lg text-white shadow-sm relative`}
                              style={{
                                backgroundColor:
                                  message.sender.messageColor || "#3B82F6",
                              }}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs mt-1 opacity-80">
                                {message.sender.username}
                              </p>

                              {/* Bouton pour ajouter une réaction */}
                              <div
                                className={`absolute ${
                                  message.sender.id === user?.id
                                    ? "left-0 -ml-8"
                                    : "right-0 -mr-8"
                                } top-1/2 transform -translate-y-1/2`}
                              >
                                <ReactionButton
                                  onReactionSelect={(emoji) =>
                                    addReaction(message.id, emoji)
                                  }
                                  position={
                                    message.sender.id === user?.id
                                      ? "top"
                                      : "top"
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          {/* Affichage des réactions */}
                          {message.reactions &&
                            message.reactions.length > 0 && (
                              <MessageReactions
                                reactions={message.reactions}
                                currentUserId={user?.id || ""}
                                onAddReaction={(emoji) =>
                                  addReaction(message.id, emoji)
                                }
                                onRemoveReaction={(emoji) =>
                                  removeReaction(message.id, emoji)
                                }
                              />
                            )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                        <p>Aucun message dans cette conversation</p>
                      </div>
                    </div>
                  )}
                </div>
              </WizzEffect>
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <WizzButton onWizzSend={sendWizz} />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4" />
              <p>Sélectionnez une conversation pour commencer</p>
            </div>
          </div>
        )}
      </div>

      {/* User Settings Modal */}
      {showSettings && <UserSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
