import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types pour l'API
export interface User {
  id: string;
  email: string;
  username: string;
  isOnline?: boolean;
  createdAt?: Date;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface Conversation {
  id: string;
  updatedAt: string;
  participants: User[];
  messages: Message[];
}

export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
  };
}

export interface CreateConversationData {
  recipientId: string;
}

export interface SendMessageData {
  content: string;
}

// Services API
export const authApi = {
  register: async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  logout: async (userId: string) => {
    const response = await api.post("/auth/logout", { userId });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth");
    return response.data;
  },
};

export const chatApi = {
  getConversations: async () => {
    const response = await api.get("/chat");
    return response.data;
  },

  getConversation: async (conversationId: string) => {
    const response = await api.get(`/chat/${conversationId}`);
    return response.data;
  },

  createConversation: async (data: CreateConversationData) => {
    const response = await api.post("/chat", data);
    return response.data;
  },

  sendMessage: async (conversationId: string, data: SendMessageData) => {
    const response = await api.post(`/chat/${conversationId}`, data);
    return response.data;
  },
};

export const userApi = {
  getUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  getUser: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};
