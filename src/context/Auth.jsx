import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext({ user: null, loading: true, role: 'user', artistStatus: 'none' });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('user');
  const [artistStatus, setArtistStatus] = useState('none');

  const applyMe = useCallback((me) => {
    // Merge avatar / full name (from /auth/me) onto the user so the whole app
    // can show the signed-in user's profile picture. Token responses omit them.
    const u = me?.user
      ? { ...me.user, avatar_url: me.avatar_url ?? null, full_name: me.full_name ?? null }
      : null;
    setUser(u);
    setRole(me?.role || 'user');
    setArtistStatus(me?.artist_status || 'none');
  }, []);

  // Re-pull the full profile (used after a DP change so the avatar updates everywhere).
  const refreshUser = useCallback(async () => {
    try { applyMe(await api.auth.me()); } catch { /* ignore */ }
  }, [applyMe]);

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
      refreshUser();  // pull avatar / full name not present in the token response
      return { data, error: null };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      const data = await api.auth.login({ email, password });
      applyMe({ user: data.user, role: data.role, artist_status: data.artist_status });
      refreshUser();  // pull avatar / full name not present in the token response
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

  // Email a reset link. Doesn't touch auth state; resolves either way.
  const forgotPassword = async (email) => {
    try {
      await api.auth.forgotPassword(email);
      return { error: null };
    } catch (e) {
      return { error: { message: e.message } };
    }
  };

  // Set a new password from the emailed token, then sign the user in.
  const resetPassword = async ({ token, password }) => {
    try {
      const data = await api.auth.resetPassword({ token, password });
      applyMe({ user: data.user, role: data.role, artist_status: data.artist_status });
      return { data, error: null };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, artistStatus, refreshUser, signUp, signIn, signOut, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
