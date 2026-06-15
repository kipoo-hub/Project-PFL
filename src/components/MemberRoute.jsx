import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMemberAuth } from '../context/MemberAuthContext';

/**
 * MemberRoute — protects /member/* routes.
 * - If NOT logged in → redirect to /member/login (remembers intended URL via `state.from`)
 * - If already logged in and tries to access auth pages → redirect to /member/dashboard
 */
export function MemberProtectedRoute() {
  const { isLoggedIn } = useMemberAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/member/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * MemberGuestRoute — prevents logged-in members from accessing auth pages.
 * Use on /member/login and /member/register.
 */
export function MemberGuestRoute() {
  const { isLoggedIn } = useMemberAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/member/dashboard';

  if (isLoggedIn) {
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
