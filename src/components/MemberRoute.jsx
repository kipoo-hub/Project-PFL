import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMemberAuth } from '../context/MemberAuthContext';

/**
 * AdminProtectedRoute — protects /dashboard/** routes.
 * - If NOT logged in → redirect to /login
 * - If logged in but NOT admin → redirect to appropriate route based on role
 */
export function AdminProtectedRoute() {
  const { isLoggedIn, member, loading } = useMemberAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Memuat autentikasi...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (member?.role !== 'admin') {
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
