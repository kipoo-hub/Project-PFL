import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMemberAuth } from '../context/MemberAuthContext';
import { supabase } from '../lib/supabase';

/**
 * AdminProtectedRoute — protects /dashboard/** routes.
 * - If NOT logged in → redirect to /login
 * - If logged in but NOT admin → redirect to appropriate route based on role
 *
 * Tambahan: jika context member mengatakan 'member', kita tetap cek langsung
 * ke Supabase untuk memastikan — mencegah race condition handleAuthChange.
 */
export function AdminProtectedRoute() {
  const { isLoggedIn, member, loading } = useMemberAuth();
  const location = useLocation();
  const [directRole, setDirectRole] = useState(null);
  const [checking, setChecking] = useState(true);

  // Cek langsung ke Supabase untuk memastikan role
  useEffect(() => {
    const fetchDirectRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();
          setDirectRole(profile?.role || null);
        }
      } catch (_) {}
      setChecking(false);
    };
    fetchDirectRole();
  }, []);

  if (loading || checking) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Memuat autentikasi...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Gunakan role dari query langsung sebagai prioritas, fallback ke context
  const effectiveRole = directRole || member?.role;
  
  if (effectiveRole !== 'admin') {
    return <Navigate to="/member" replace />;
  }

  return <Outlet />;
}

/**
 * MemberProtectedRoute — protects /member/** routes.
 * - If NOT logged in → redirect to /login
 * - If logged in but NOT member → redirect to /dashboard (admin dashboard)
 */
export function MemberProtectedRoute() {
  const { isLoggedIn, member, loading } = useMemberAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Memuat autentikasi...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (member?.role !== 'member') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

/**
 * GuestRoute — blocks logged-in users from accessing auth pages (/login, etc.)
 */
export function GuestRoute() {
  const { isLoggedIn, member, loading } = useMemberAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Memuat...</div>;
  }

  if (isLoggedIn) {
    const destination = member?.role === 'admin' ? '/dashboard' : '/member';
    const from = location.state?.from?.pathname || destination;
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
