"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, authApi } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
    messageColor?: string
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        // Définir le cookie pour le middleware
        document.cookie = `token=${storedToken}; path=/; max-age=2592000`; // 30 jours
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to get current user:", error);
          localStorage.removeItem("token");
          document.cookie =
            "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { access_token } = response.user;

      localStorage.setItem("token", access_token);
      document.cookie = `token=${access_token}; path=/; max-age=2592000`; // 30 jours
      setToken(access_token);

      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    messageColor?: string
  ) => {
    try {
      const response = await authApi.register({
        email,
        username,
        password,
        messageColor,
      });
      const { access_token } = response.user;

      localStorage.setItem("token", access_token);
      document.cookie = `token=${access_token}; path=/; max-age=2592000`; // 30 jours
      setToken(access_token);

      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    if (user) {
      authApi.logout(user.id).catch(console.error);
    }
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
