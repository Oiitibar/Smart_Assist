import api from "./axios";

export const registerUser = async (userData) => {
  const res = await api.post("/auth/register", userData);
  return res.data;
};

export const loginUser = async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

// Alias name, useful if some components call getMe()
export const getMe = getCurrentUser;

export const updateProfile = async (profileData) => {
  const res = await api.put("/users/profile", profileData);
  return res.data;
};

export const updatePreferences = async (preferences) => {
  const res = await api.put("/users/preferences", preferences);
  return res.data;
};
