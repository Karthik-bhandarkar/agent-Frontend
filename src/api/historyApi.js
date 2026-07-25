// src/api/historyApi.js
/**
 * @fileoverview API wrappers for conversation history endpoints.
 */
import apiClient from "./client";

/**
 * Fetches the user's past conversation turns.
 * 
 * @param {string} userId - The unique identifier of the current user.
 * @returns {Promise<Object>} A promise resolving to the history object containing `turns` and `total_turns`.
 * @throws {Error} Throws an Axios error if the request fails.
 */
export const getHistory = async (userId) => {
  const response = await apiClient.get(`/history/${userId}`);
  return response.data;
};
