"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";
import { getCookie, removeCookie, setCookie } from "./cookies";
import type { AuthUser } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function dashboardPathFor(role: string) {
  if (role === "admin") return "/admin";
  if (role === "guru") return "/guru";
  return "/siswa";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getCookie("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        removeCookie("user");
      }
    }
    setLoading(false);
  }, []);

  async function login(username: string, password: string) {
    const { data } = await api.post("/login", { username, password });
    setCookie("token", data.token);
    setCookie("user", JSON.stringify(data.user));
    setCookie("role", data.user.role);
    setUser(data.user);
    return data.user as AuthUser;
  }

  async function logout() {
    try {
      await api.post("/logout");
    } catch {
      // ignore network errors on logout
    }
    removeCookie("token");
    removeCookie("user");
    removeCookie("role");
    setUser(null);
    // Full reload so the client router cache from the previous session
    // (e.g. a cached redirect from role mismatch) doesn't linger.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { dashboardPathFor };
