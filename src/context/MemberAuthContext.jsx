import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ── Storage key ──────────────────────────────────────────────
const STORAGE_KEY = 'memberUser';

// ── Initial state ─────────────────────────────────────────────
const getInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const member = JSON.parse(stored);
      // loading: true — jangan biarkan GuestRoute/MemberRoute redirect
      // berdasarkan data stale. Tunggu getSession + handleAuthChange dulu.
      return { member, isLoggedIn: true, loading: true };
    }
  } catch (_) {}
  return { member: null, isLoggedIn: false, loading: true };
};

// ── Reducer ───────────────────────────────────────────────────
function memberReducer(state, action) {
  switch (action.type) {
    case 'LOGIN': {
      const member = action.payload;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(member)); } catch (_) {}
      return { member, isLoggedIn: true, loading: false };
    }
    case 'LOGOUT': {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      return { member: null, isLoggedIn: false, loading: false };
    }
    case 'SET_LOADING': {
      return { ...state, loading: action.payload };
    }
    case 'UPDATE_PROFILE': {
      const updated = { ...state.member, ...action.payload };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (_) {}
      return { ...state, member: updated };
    }
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────
const MemberAuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────
export function MemberAuthProvider({ children }) {
  const [state, dispatch] = useReducer(memberReducer, undefined, getInitialState);

  const handleAuthChange = async (session) => {
    if (session?.user) {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // Fetch user profile from profiles table to get their role ('admin' | 'member')
        // Pakai .maybeSingle() — lebih aman, tidak return error untuk 0 rows
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profile && !error) {
          console.log('[Auth] Profile ditemukan, role:', profile.role);
          dispatch({
            type: 'LOGIN',
            payload: {
              id: session.user.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              created_at: profile.created_at
            }
          });
        } else {
          console.warn('[Auth] Profile tidak ditemukan, fallback ke metadata, error:', error?.message);
          // Fallback if profile doesn't exist yet (trigger might be delayed)
          dispatch({
            type: 'LOGIN',
            payload: {
              id: session.user.id,
              name: session.user.user_metadata?.name || 'Member',
              email: session.user.email,
              role: session.user.user_metadata?.role || 'member',
              created_at: session.user.created_at
            }
          });
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Soft fallback
        dispatch({
          type: 'LOGIN',
          payload: {
            id: session.user.id,
            name: session.user.user_metadata?.name || 'Member',
            email: session.user.email,
            role: session.user.user_metadata?.role || 'member',
            created_at: session.user.created_at
          }
        });
      }
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Sync session on mount & listen to changes
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // AWAIT handleAuthChange — jangan set loading:false sebelum
        // query profile selesai, agar GuestRoute/MemberRoute punya
        // role yang akurat (bukan dari localStorage stale).
        await handleAuthChange(session);
      }
      // Jangan dispatch LOGOUT jika session null — biarkan onAuthStateChange
      // yang handle state sebenarnya. Ini mencegah race condition saat login:
      // getSession() bisa null sebelum onAuthStateChange selesai.
      dispatch({ type: 'SET_LOADING', payload: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (name, email, password, role = 'member') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (data) => {
    if (!state.member?.id) return;
    const { error } = await supabase
      .from('profiles')
      .update({ name: data.name })
      .eq('user_id', state.member.id);

    if (error) throw error;
    dispatch({ type: 'UPDATE_PROFILE', payload: { name: data.name } });
  };

  return (
    <MemberAuthContext.Provider value={{ ...state, signUp, signIn, logout, updateProfile }}>
      {children}
    </MemberAuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useMemberAuth() {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) throw new Error('useMemberAuth must be used inside MemberAuthProvider');
  return ctx;
}

export default MemberAuthContext;
