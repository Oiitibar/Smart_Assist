import api from "./axios";
import {
  clearStoredToken,
  storeToken,
} from "./authToken";

const tokenFromResponse = (payload) =>
  payload?.token || payload?.data?.token || "";

const rememberAuthToken = (payload) => {
  const token = tokenFromResponse(payload);
  if (token) storeToken(token);
  return payload;
};

export const registerUser = async (userData) => {
  const res = await api.post("/auth/register", userData);
  return rememberAuthToken(res.data);
};

export const loginUser = async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  return rememberAuthToken(res.data);
};

export const logoutUser = async () => {
  try {
    const res = await api.post("/auth/logout");
    return res.data;
  } finally {
    // Local cleanup must happen even when the backend is unavailable.
    clearStoredToken();
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await api.get("/auth/me");
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      clearStoredToken();
    }
    throw error;
  }
};

export const getMe = getCurrentUser;

export const updateProfile = async (profileData) => {
  const res = await api.put("/users/profile", profileData);
  return res.data;
};

export const updatePreferences = async (preferences) => {
  const res = await api.put("/users/preferences", preferences);
  return res.data;
};
