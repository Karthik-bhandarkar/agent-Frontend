// src/api/auth.js
/**
 * @fileoverview Authentication endpoints (signup, login).
 * Note: These currently use raw fetch() rather than the shared Axios client.
 */
const API_BASE_URL = "https://agent-backend-t11g.onrender.com";

/**
 * Registers a new user.
 * 
 * @param {Object} params
 * @param {string} params.name - User's full name.
 * @param {string} params.email - User's email address.
 * @param {string} params.password - User's plaintext password.
 * @returns {Promise<Object>} The signup response containing user details and token.
 * @throws {Error} Throws an Error with the backend's failure detail if the request fails (e.g., email already exists).
 */
export async function signupApi({ name, email, password }) {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Signup failed");
  }

  return res.json();
}

/**
 * Authenticates an existing user.
 * 
 * @param {Object} params
 * @param {string} params.email - User's email address.
 * @param {string} params.password - User's plaintext password.
 * @returns {Promise<Object>} The login response containing user details and token.
 * @throws {Error} Throws an Error with the backend's failure detail if credentials are invalid.
 */
export async function loginApi({ email, password }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Login failed");
  }

  return res.json();
}
