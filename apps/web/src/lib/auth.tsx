import * as React from "react";
import { api } from "@/lib/api";

interface AuthState {
  ready: boolean;
  authed: boolean;
  needsSetup: boolean;
  username: string | null;
  refresh: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  setup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);
  const [needsSetup, setNeedsSetup] = React.useState(false);
  const [username, setUsername] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      const status = await api.status();
      setNeedsSetup(!status.setup);
      if (status.setup) {
        try {
          const me = await api.me();
          setAuthed(true);
          setUsername(me.admin.username);
        } catch {
          setAuthed(false);
          setUsername(null);
        }
      } else {
        setAuthed(false);
      }
    } finally {
      setReady(true);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = React.useCallback(
    async (u: string, p: string) => {
      await api.login(u, p);
      await refresh();
    },
    [refresh],
  );

  const setup = React.useCallback(
    async (u: string, p: string) => {
      await api.setup(u, p);
      await refresh();
    },
    [refresh],
  );

  const logout = React.useCallback(async () => {
    await api.logout();
    setAuthed(false);
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ ready, authed, needsSetup, username, refresh, login, setup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
