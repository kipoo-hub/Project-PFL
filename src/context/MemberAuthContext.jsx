import React, { createContext, useContext, useReducer, useEffect } from 'react';

// ── Storage key ──────────────────────────────────────────────
const STORAGE_KEY = 'vet_member';

// ── Initial state ─────────────────────────────────────────────
const getInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const member = JSON.parse(stored);
      return { member, isLoggedIn: true };
    }
  } catch (_) {}
  return { member: null, isLoggedIn: false };
};

// ── Reducer ───────────────────────────────────────────────────
function memberReducer(state, action) {
  switch (action.type) {
    case 'REGISTER':
    case 'LOGIN': {
      const member = action.payload;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(member)); } catch (_) {}
      return { member, isLoggedIn: true };
    }
    case 'LOGOUT': {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      return { member: null, isLoggedIn: false };
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

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        if (!e.newValue) {
          dispatch({ type: 'LOGOUT' });
        } else {
          try {
            dispatch({ type: 'LOGIN', payload: JSON.parse(e.newValue) });
          } catch (_) {}
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const register = (memberData) => {
    const member = {
      id: `m_${Date.now()}`,
      registeredAt: new Date().toISOString(),
      ...memberData,
    };
    dispatch({ type: 'REGISTER', payload: member });
    return member;
  };

  const login = (credentials) => {
    // Mock: accept any email/password and match to stored member
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const member = JSON.parse(stored);
        if (member.email === credentials.email) {
          dispatch({ type: 'LOGIN', payload: member });
          return { success: true, member };
        }
      } catch (_) {}
    }
    // Demo fallback: create a demo member
    const demoMember = {
      id: `m_demo_${Date.now()}`,
      name: 'Demo Member',
      email: credentials.email,
      phone: '0812-0000-0000',
      registeredAt: new Date().toISOString(),
    };
    dispatch({ type: 'LOGIN', payload: demoMember });
    return { success: true, member: demoMember };
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  const updateProfile = (data) => dispatch({ type: 'UPDATE_PROFILE', payload: data });

  return (
    <MemberAuthContext.Provider value={{ ...state, register, login, logout, updateProfile }}>
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
