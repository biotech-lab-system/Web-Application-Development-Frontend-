"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, apiRequest } from "@/lib/api";
import type { AuthSession, AuthUser, LoginInput, RegisterInput } from "@/types";

const STORAGE_KEY = "helix-auth-session";

interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_at: string;
  user: AuthUser;
}

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  loading: boolean;
  login: (input: LoginInput, persistent: boolean) => Promise<AuthSession>;
  register: (input: RegisterInput, persistent: boolean) => Promise<AuthSession>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function removeStoredSession() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

function readStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as AuthSession;
    if (!value.accessToken || !value.user || new Date(value.expiresAt).getTime() <= Date.now()) {
      removeStoredSession();
      return null;
    }
    return value;
  } catch {
    removeStoredSession();
    return null;
  }
}

function writeStoredSession(value: AuthSession) {
  removeStoredSession();
  (value.persistent ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(value));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const authRevision = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = readStoredSession();
      const revision = authRevision.current;
      setSession(stored);
      setLoading(false);
      if (stored) {
        apiRequest<AuthUser>("/users/me", {}, stored.accessToken)
          .then((user) => {
            if (authRevision.current !== revision) return;
            const refreshed = { ...stored, user };
            writeStoredSession(refreshed);
            setSession((current) => current?.accessToken === stored.accessToken ? refreshed : current);
          })
          .catch((error: unknown) => {
            if (authRevision.current === revision && error instanceof ApiError && error.status === 401) {
              removeStoredSession();
              setSession((current) => current?.accessToken === stored.accessToken ? null : current);
            }
          });
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const saveSession = useCallback((response: LoginResponse, persistent: boolean) => {
    const next: AuthSession = {
      accessToken: response.access_token,
      expiresAt: response.expires_at,
      user: response.user,
      persistent,
    };
    authRevision.current += 1;
    writeStoredSession(next);
    setSession(next);
    return next;
  }, []);

  const login = useCallback(async (input: LoginInput, persistent: boolean) => {
    const response = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return saveSession(response, persistent);
  }, [saveSession]);

  const register = useCallback(async (input: RegisterInput, persistent: boolean) => {
    await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return login({ identifier: input.username, password: input.password }, persistent);
  }, [login]);

  const logout = useCallback(async () => {
    const token = session?.accessToken;
    try {
      if (token) await apiRequest("/auth/logout", { method: "POST" }, token);
    } catch {
      // Local sign-out must still succeed if the API is unavailable.
    } finally {
      authRevision.current += 1;
      removeStoredSession();
      setSession(null);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const remaining = new Date(session.expiresAt).getTime() - Date.now();
    const timer = window.setTimeout(() => {
      authRevision.current += 1;
      removeStoredSession();
      setSession(null);
    }, Math.max(0, Math.min(remaining, 2_147_000_000)));
    return () => window.clearTimeout(timer);
  }, [session]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    login,
    register,
    logout,
  }), [session, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
