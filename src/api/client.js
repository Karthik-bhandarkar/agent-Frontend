// src/api/client.js
/**
 * @fileoverview Shared Axios instance for backend communication.
 * Configures the base URL and an interceptor to automatically attach
 * the JWT token from local storage to every request's Authorization header.
 */
import axios from "axios";

// 🔹 Production Backend URL — https://agent-backend-t11g.onrender.com
// 🔹 For local dev, change this to: http://localhost:8000
export const API_BASE_URL = "https://agent-backend-t11g.onrender.com";
// 🔹 Preconfigured axios instance for all API calls
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Add a request interceptor to attach the Token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Default export (if you want to import the client)
export default client;
