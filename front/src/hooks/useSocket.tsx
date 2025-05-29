"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    // Nettoyer la connexion précédente
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }

    // Ne pas se connecter si pas de token
    if (!token) {
      return;
    }

    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
      {
        auth: {
          token: token,
        },
      }
    );

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to socket server");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from socket server");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Seulement le token comme dépendance

  const value = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
