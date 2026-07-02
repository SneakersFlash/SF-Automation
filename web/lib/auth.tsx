'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, clearToken, getToken, setToken } from './api';
import type { Role } from './nav';

// Sesi auth klien (UF-01/02). Menggantikan placeholder lib/session.ts.
export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  isActive: boolean;
}

interface LoginResult {
  token: string;
  user: { id: string; name: string | null; email: string; role: Role };
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean; // true selagi hidrasi sesi awal
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Hidrasi sesi dari token cookie saat mount (mis. setelah refresh halaman).
  useEffect(() => {
    let active = true;
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api<AuthUser>('/auth/me')
      .then((me) => {
        if (active) setUser(me);
      })
      .catch(() => {
        // Token invalid/kedaluwarsa → bersihkan.
        clearToken();
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<LoginResult>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    setToken(res.token);
    setUser({ ...res.user, isActive: true });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Stateless — abaikan kegagalan; klien tetap keluar.
    }
    clearToken();
    setUser(null);
    router.replace('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>.');
  return ctx;
}
