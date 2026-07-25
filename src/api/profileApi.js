// src/api/profileApi.js
/**
 * @fileoverview API wrappers for user profile endpoints.
 */
import apiClient from "./client";

/**
 * Creates or updates a user's health profile.
 * 
 * @param {Object} data - The profile data payload, containing user_id and health metrics.
 * @returns {Promise<Object>} A promise resolving to a success message and the updated profile object.
 * @throws {Error} Throws an Axios error if the request fails.
 */
export const setupProfile = async (data) => {
  const response = await apiClient.post("/profile/setup", data);
  return response.data;
};

/**
 * Retrieves a user's health profile.
 * 
 * @param {string} userId - The unique identifier of the current user.
 * @returns {Promise<Object>} A promise resolving to the profile data, or an empty profile dict if unset.
 * @throws {Error} Throws an Axios error if the request fails.
 */
export const getProfile = async (userId) => {
  const response = await apiClient.get(`/profile/get/${userId}`);
  return response.data;
};
