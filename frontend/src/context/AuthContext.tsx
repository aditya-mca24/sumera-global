import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { apiFetch, getToken, setToken as saveToken, clearToken } from '../lib/api';
import { Profile } from '../types';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  is_email_verified?: boolean;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
}

// API may return additional fields such as `updated_at` and role/is_admin may be optional
interface ApiUser {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  is_admin?: boolean | null;
  role?: 'user' | 'admin' | 'super_admin' | string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  function mapApiUserToUser(prof: ApiUser): User {
    const role: 'user' | 'admin' | 'super_admin' = (prof.role as any) ?? 'user';

    return {
      id: prof.id,
      email: prof.email ?? '',
      full_name: prof.full_name ?? null,
      phone: prof.phone ?? null,
      avatar_url: prof.avatar_url ?? null,
      is_admin: Boolean(prof.is_admin),
      role,
      created_at: prof.created_at ?? new Date().toISOString(),
    };
  }

  function mapUserToProfile(user: User, prof: ApiUser): Profile {
    return {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      is_admin: user.is_admin,
      role: user.role,
      created_at: user.created_at,
      updated_at: prof.updated_at ?? user.created_at,
    };
  }

  async function loadProfile() {
    const response = await apiFetch<{ user: ApiUser }>(`/auth/me`);
    if (!mounted.current) return;

    const userData = mapApiUserToUser(response.user);
    if (!mounted.current) return;
    setUser(userData);
    setProfile(mapUserToProfile(userData, response.user));
  }

  async function refreshProfile() {
    const token = getToken();
    if (!token) return;
    try {
      await loadProfile();
    } catch (err) {
      console.error('Refresh profile failed', err);
    }
  }

  useEffect(() => {
    mounted.current = true;
    const token = getToken();

    if (token) {
      loadProfile()
        .catch((err) => {
          console.error('Failed to load authenticated user:', err);
          clearToken();
          if (mounted.current) {
            setUser(null);
            setProfile(null);
          }
        })
        .finally(() => {
          if (mounted.current) setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      mounted.current = false;
    };
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const response = await apiFetch<{ user: ApiUser; token: string }>(`/auth/login`, {
        method: 'POST',
        body: { email, password },
      });

      saveToken(response.token);
      const userData = mapApiUserToUser(response.user);
      setUser(userData);
      setProfile(mapUserToProfile(userData, response.user));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to sign in' };
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    try {
      const response = await apiFetch<{ user: ApiUser; token: string }>(`/auth/register`, {
        method: 'POST',
        body: { email, password, full_name: fullName },
      });

      saveToken(response.token);
      const userData = mapApiUserToUser(response.user);
      setUser(userData);
      setProfile(mapUserToProfile(userData, response.user));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to sign up' };
    }
  }

  async function signOut() {
    try {
      await apiFetch(`/auth/logout`, { method: 'POST' });
    } catch (err) {
      console.error('Sign out warning:', err);
    }

    clearToken();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile, setUser, setToken: saveToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
