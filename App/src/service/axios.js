import axios from "axios";

// Base Axios instance for Smart Assist
// Update baseURL to match your Express server / .env value
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // required since JWT is stored in cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor: auto-handle expired/invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("Not logged in or session expired.");
    }

    return Promise.reject(error);
  }
);

export default api;
