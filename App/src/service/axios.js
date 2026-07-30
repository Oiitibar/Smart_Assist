import axios from "axios";
import {
  clearStoredToken,
  getStoredToken,
} from "./authToken";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
  withCredentials: true,
  timeout: 60000,
});

// Browser cookies remain enabled. The Bearer token is a reliable fallback
// when a frontend on localhost/Vercel calls a backend on onrender.com and the
// browser blocks third-party cookies.
api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const unwrap = (response) =>
  response?.data?.data ?? response?.data;

export const getErrorMessage = (
  error,
  fallback = "Something went wrong",
) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestPath = String(error.config?.url || "");
      const isCredentialCheck =
        requestPath.includes("/auth/me") ||
        !requestPath.includes("/auth/login");

      if (isCredentialCheck) {
        clearStoredToken();
      }

      console.warn("Not logged in or session expired.");
    }

    return Promise.reject(error);
  },
);

export default api;
