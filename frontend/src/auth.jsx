import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, getToken } from './api';

const AuthCtx = createContext(null);
export function useAuth() { return useContext(AuthCtx); }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (getToken()) {
          const u = await api.me();
          setUser(u);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  async function login(username, password) {
    const { token, user } = await api.login({ username, password });
    setToken(token); setUser(user);
  }

  function logout() { localStorage.removeItem('token'); setUser(null); }

  return <AuthCtx.Provider value={{ user, setUser, login, logout, loading }}>{children}</AuthCtx.Provider>;
}
