import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
  withCredentials: true,
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
      console.warn("Not logged in or session expired.");
    }

    return Promise.reject(error);
  },
);

export default api;
