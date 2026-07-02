import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ── Storage key ──────────────────────────────────────────────
const STORAGE_KEY = 'memberUser';

// ── Initial state ─────────────────────────────────────────────
const getInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const profile = JSON.parse(stored);
      // loading: true — wait for fresh session check
      return {
        user: { id: profile.user_id || profile.id, email: profile.email },
        profile: { ...profile, full_name: profile.name || profile.full_name },
        member: { ...profile, full_name: profile.name || profile.full_name },
        isLoggedIn: true,
        loading: true,
        session: null
      };
    }
  } catch (_) {}
  return { user: null, profile: null, member: null, isLoggedIn: false, loading: true, session: null };
};

// ── Reducer ───────────────────────────────────────────────────
function memberReducer(state, action) {
  switch (action.type) {
    case 'LOGIN': {
      const { user, profile, session } = action.payload;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch (_) {}
      return {
        user,
        profile,
        member: profile,
        isLoggedIn: true,
        loading: false,
        session
      };
    }
    case 'LOGOUT': {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      return {
        user: null,
        profile: null,
        member: null,
        isLoggedIn: false,
        loading: false,
        session: null
      };
    }
    case 'SET_LOADING': {
      return { ...state, loading: action.payload };
    }
    case 'UPDATE_PROFILE': {
      const updatedProfile = { ...state.profile, ...action.payload, name: action.payload.name };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile)); } catch (_) {}
      return {
        ...state,
        profile: updatedProfile,
        member: updatedProfile
      };
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
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profile && !error) {
          console.log('[Auth] Profile ditemukan, role:', profile.role);
          const profileWithFullName = {
            ...profile,
            id: profile.user_id || profile.id || session.user.id,
            full_name: profile.name || profile.full_name || session.user.user_metadata?.name || 'User',
          };
          dispatch({
            type: 'LOGIN',
            payload: {
              user: { id: session.user.id, email: session.user.email },
              profile: profileWithFullName,
              session
            }
          });
        } else {
          console.warn('[Auth] Profile tidak ditemukan, fallback ke metadata, error:', error?.message);
          const fallbackProfile = {
            user_id: session.user.id,
            id: session.user.id,
            name: session.user.user_metadata?.name || 'User',
            full_name: session.user.user_metadata?.name || 'User',
            email: session.user.email,
            role: session.user.user_metadata?.role || 'guest',
            created_at: session.user.created_at
          };
          dispatch({
            type: 'LOGIN',
            payload: {
              user: { id: session.user.id, email: session.user.email },
              profile: fallbackProfile,
              session
            }
          });
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        const fallbackProfile = {
          user_id: session.user.id,
          id: session.user.id,
          name: session.user.user_metadata?.name || 'User',
          full_name: session.user.user_metadata?.name || 'User',
          email: session.user.email,
          role: session.user.user_metadata?.role || 'guest',
          created_at: session.user.created_at
        };
        dispatch({
          type: 'LOGIN',
          payload: {
            user: { id: session.user.id, email: session.user.email },
            profile: fallbackProfile,
            session
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

  const signUp = async (name, email, password, role = 'guest') => {
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
    const userId = state.profile?.user_id || state.profile?.id || state.user?.id;
    if (!userId) return;
    const { error } = await supabase
      .from('profiles')
      .update({ name: data.name })
      .eq('user_id', userId);

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

export function redirectByRole(role, navigate) {
  if (role === 'admin')  return navigate('/dashboard', { replace: true });
  if (role === 'member') return navigate('/member/membership', { replace: true });
  return navigate('/guest', { replace: true });  // guest & fallback
}

export default MemberAuthContext;
