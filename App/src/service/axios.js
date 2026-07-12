import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // important for JWT cookie auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Use this when backend response may be:
// { data: actualData }
// or just actualData
export const unwrap = (response) => response?.data?.data ?? response?.data;

// Use this to show clean error messages in UI
export const getErrorMessage = (error, fallback = "Something went wrong") => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("Not logged in or session expired.");
      // Optional later:
      // window.location.href = "/Smart_Assist/Login";
    }

    return Promise.reject(error);
  }
);

export default api;