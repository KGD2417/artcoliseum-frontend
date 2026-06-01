import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext({ user: null, loading: true, role: 'user', artistStatus: 'none' });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('user');
  const [artistStatus, setArtistStatus] = useState('none');

  const applyMe = useCallback((me) => {
    setUser(me?.user ?? null);
    setRole(me?.role || 'user');
    setArtistStatus(me?.artist_status || 'none');
  }, []);

  // Restore session on mount (if we have a refresh token).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!api.hasSession()) { setLoading(false); return; }
      try {
        const me = await api.auth.me();
        if (!cancelled) applyMe(me);
      } catch {
        if (!cancelled) { api.clearTokens(); applyMe(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [applyMe]);

  // Re-sync role/status when the tab regains focus (cheap stand-in for realtime).
  useEffect(() => {
    if (!user) return;
    const onFocus = async () => {
      try { applyMe(await api.auth.me()); } catch { /* ignore */ }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user, applyMe]);

  // Keep the Supabase-style { error } return shape so SignIn.jsx is unchanged.
  const signUp = async ({ email, password, fullName, phone }) => {
    try {
      const data = await api.auth.register({ email, password, full_name: fullName, phone });
      applyMe({ user: data.user, role: data.role, artist_status: data.artist_status });
      return { data, error: null };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      const data = await api.auth.login({ email, password });
      applyMe({ user: data.user, role: data.role, artist_status: data.artist_status });
      return { data, error: null };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  };

  const signOut = async () => {
    await api.auth.logout();
    applyMe(null);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, artistStatus, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
