// src/context/AuthContext.jsx
/**
 * @fileoverview Global authentication context.
 * Holds the logged-in user, token, and loading state. Persists state to local
 * storage and exposes actions for login, logout, and updating the user's profile status.
 */
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

/**
 * Provider component that wraps the application to supply auth state.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components to render.
 * @returns {JSX.Element} The AuthContext provider wrapping children.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [profileCompleted, setProfileCompleted] = useState(
    localStorage.getItem("profileCompleted") === "true"
  );

  // login(token, userData)
  // inside AuthProvider in src/context/AuthContext.jsx, replace login implementation with:

  /**
   * Logs in a user by saving their token and profile data.
   * 
   * @param {string} jwtToken - The JWT authentication token.
   * @param {Object|string} userData - The user's profile object (or JSON string).
   */
const login = (jwtToken, userData = null) => {
  // Save token
  if (jwtToken) {
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
  } else {
    setToken(null);
    localStorage.removeItem("token");
  }

  // Defensive: if userData is a string (accidential token or JSON string), try to parse it
  let normalizedUser = null;
  if (userData && typeof userData === "object") {
    normalizedUser = userData;
  } else if (typeof userData === "string") {
    try {
      // If userData was JSON serialized, parse it; otherwise it's likely a token string -> ignore
      const parsed = JSON.parse(userData);
      if (parsed && typeof parsed === "object") normalizedUser = parsed;
    } catch (err) {
      // userData was not JSON: ignore it (somewhere stored token into 'user' by mistake)
      normalizedUser = null;
    }
  }

  if (normalizedUser) {
    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    // sync profileCompleted flag if server included it in the returned user object
    if (normalizedUser.profile_complete !== undefined) {
      setProfileCompleted(Boolean(normalizedUser.profile_complete));
      localStorage.setItem("profileCompleted", Boolean(normalizedUser.profile_complete));
    }
  } else {
    // no valid user object passed — clear stored user (or keep previous one? we clear to be safe)
    setUser(null);
    localStorage.removeItem("user");
  }
};


  /**
   * Logs out the user by clearing state and local storage.
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    setProfileCompleted(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profileCompleted");
  };

  /**
   * Updates state and storage to mark the user's profile as completed.
   */
  const markProfileCompleted = () => {
    setProfileCompleted(true);
    localStorage.setItem("profileCompleted", "true");
    // update user object in localStorage too:
    const u = user ? { ...user, profile_complete: true } : null;
    setUser(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, profileCompleted, login, logout, markProfileCompleted }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to consume the AuthContext.
 * 
 * @returns {Object} The auth context value (user, token, profileCompleted, login, logout, markProfileCompleted).
 * @throws {Error} Technically does not throw currently, but will return null if used outside a provider.
 * Context value changes (like login/logout) will trigger a re-render in consuming components.
 */
export const useAuth = () => useContext(AuthContext);
