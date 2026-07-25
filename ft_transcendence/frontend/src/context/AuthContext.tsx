import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SESSION_EXPIRED_EVENT,
  transcendenceApi,
} from "../lib/transcendenceApi";
import type { SessionUser } from "../types/api";

type AuthState = { token: string; user: SessionUser } | null;
type AuthContextValue = {
  session: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (
    userName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  updateSessionUser: (user: Partial<SessionUser>) => void;
};

const STORAGE_KEY = "transcendence-session";
const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const session = raw ? (JSON.parse(raw) as AuthState) : null;
    if (session && tokenExpired(session.token)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function tokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthState>(readSession);
  const navigate = useNavigate();
  const location = useLocation();

  const save = useCallback((next: AuthState) => {
    setSession(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    const expire = () => {
      save(null);
      navigate("/login", {
        replace: true,
        state: { from: `${location.pathname}${location.search}` },
      });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, expire);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expire);
  }, [location.pathname, location.search, navigate, save]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      login: async (email, password) => {
        const next = await transcendenceApi.login({ email, password });
        save({ token: next.accessToken, user: next.user });
      },
      register: async (userName, email, password) => {
        await transcendenceApi.register({ userName, email, password });
        const next = await transcendenceApi.login({ email, password });
        save({ token: next.accessToken, user: next.user });
      },
      logout: () => save(null),
      updateSessionUser: (user) => {
        if (session) save({ ...session, user: { ...session.user, ...user } });
      },
    }),
    [save, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
