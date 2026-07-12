import api, { unwrap } from "./axios";

export const updateProfile = async (payload) => {
  const response = await api.put("/users/profile", payload);
  return unwrap(response);
};

export const updatePreferences = async (payload) => {
  const response = await api.put("/users/preferences", payload);
  return unwrap(response);
};
