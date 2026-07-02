import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMemberAuth } from '../context/MemberAuthContext';
import { supabase } from '../lib/supabase';

/**
 * AdminProtectedRoute — protects /dashboard/** routes.
 * - If NOT logged in → redirect to /login
 * - If logged in but NOT admin → redirect to /guest
 */
export function AdminProtectedRoute() {
  const { isLoggedIn, member, loading } = useMemberAuth();
  const location = useLocation();
  const [directRole, setDirectRole] = useState(null);
  const [checking, setChecking] = useState(true);

  // Direct check to Supabase for role verification
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
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: '#16a34a', fontSize: '1rem' }}>Memuat autentikasi admin...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const effectiveRole = directRole || member?.role;
  
  if (effectiveRole !== 'admin') {
    return <Navigate to="/guest" replace />;
  }

  return <Outlet />;
}

/**
 * MemberProtectedRoute — protects /member/** routes and /membership.
 * - If NOT logged in → redirect to /login
 * - If logged in but NOT member:
 *   - If admin → redirect to /dashboard
 *   - If guest → redirect to /guest
 */
export function MemberProtectedRoute() {
  const { isLoggedIn, member, loading } = useMemberAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: '#16a34a', fontSize: '1rem' }}>Memuat autentikasi member...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (member?.role !== 'member') {
    if (member?.role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/guest" replace />;
  }

  return <Outlet />;
}

/**
 * GuestProtectedRoute — protects /guest.
 * - If NOT logged in → redirect to /login
 * - If logged in → allowed (any role)
 */
export function GuestProtectedRoute() {
  const { isLoggedIn, loading } = useMemberAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: '#16a34a', fontSize: '1rem' }}>Memuat autentikasi...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * GuestRoute — blocks logged-in users from accessing auth pages (/login, /register, etc.)
 * Redirects authenticated users to their role-specific landing pages.
 */
export function GuestRoute() {
  const { isLoggedIn, member, loading } = useMemberAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: '#16a34a', fontSize: '1rem' }}>Memuat...</div>
      </div>
    );
  }

  if (isLoggedIn) {
    let destination = '/guest';
    if (member?.role === 'admin') destination = '/dashboard';
    else if (member?.role === 'member') destination = '/member/membership';

    const from = location.state?.from?.pathname || destination;
    
    // Safety check: prevent redirecting back to protected pages not matching the role
    let finalDest = from;
    if (from.startsWith('/dashboard') && member?.role !== 'admin') finalDest = destination;
    if (from.startsWith('/member') && member?.role !== 'member') finalDest = destination;

    return <Navigate to={finalDest} replace />;
  }

  return <Outlet />;
}
