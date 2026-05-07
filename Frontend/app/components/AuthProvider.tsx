"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch } from "../lib/api";
import { useToast } from "./ToastProvider";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const TOKEN_STORAGE_KEY = "shophub-token";
const USER_STORAGE_KEY = "shophub-user";

const AuthContext = createContext<AuthContextValue | null>(null);

async function storeSession(
  setToken: (value: string | null) => void,
  setUser: (value: AuthUser | null) => void,
  payload: AuthResponse,
) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.user));
  setToken(payload.token);
  setUser(payload.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);

    if (!storedToken) {
      queueMicrotask(() => setIsLoading(false));
      return;
    }

    queueMicrotask(() => {
      setToken(storedToken);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    });

    apiFetch<{ user: AuthUser }>("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((response) => {
        queueMicrotask(() => {
          setUser(response.user);
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
        });
      })
      .catch(() => {
        queueMicrotask(() => {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
          window.localStorage.removeItem(USER_STORAGE_KEY);
          setToken(null);
          setUser(null);
        });
      })
      .finally(() => {
        queueMicrotask(() => setIsLoading(false));
      });
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    await storeSession(setToken, setUser, response);
    showToast("Login success", "success");
    return response.user;
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    await storeSession(setToken, setUser, response);
    showToast("Account created", "success");
    return response.user;
  };

  const logout = () => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
    showToast("Logged out", "info");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
