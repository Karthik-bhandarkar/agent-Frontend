// src/api/chatApi.js
/**
 * @fileoverview API wrappers for synchronous chat endpoints.
 */
import apiClient from "./client";

/**
 * Sends a message to the orchestrator synchronously.
 * 
 * @param {string} userId - The unique identifier of the current user.
 * @param {string} message - The text message sent by the user.
 * @returns {Promise<Object>} A promise that resolves to an object containing `{ response, agents_used }`.
 * @throws {Error} Throws an Axios error if the request fails.
 */
export const sendChatMessage = async (userId, message) => {
  const response = await apiClient.post("/chat", {
    user_id: userId,
    message,
  });
  return response.data;
};
