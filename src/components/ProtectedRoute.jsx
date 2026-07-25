// src/components/ProtectedRoute.jsx
/**
 * @fileoverview Protected Route wrapper.
 * Redirects unauthenticated users to the login page, and optionally enforces
 * that a user has completed their profile setup before accessing specific routes.
 */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute Component.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components (the protected page) to render if access is granted.
 * @param {boolean} [props.requireProfileComplete=false] - If true, redirects logged-in users with incomplete profiles to the setup page.
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ children, requireProfileComplete = false }) => {
  const location = useLocation();

  // ✅ Read auth state from localStorage
  const token = localStorage.getItem("token");

  const rawUser = localStorage.getItem("user");
  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }

  const profileCompleted = user?.profile_complete === true;

  // NOTE: Not logged in condition. Redirects to login and preserves the
  // intended destination in router state so they can be redirected back post-login.
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // NOTE: Profile completeness guard. Prevents access to main app features
  // until the mandatory onboarding/setup phase is finished.
  if (requireProfileComplete && !profileCompleted) {
    return <Navigate to="/profile-setup" replace />;
  }

  // ✅ All good → render the protected page
  return children;
};

export default ProtectedRoute;
