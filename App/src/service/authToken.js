const TOKEN_KEY = "smart_assist_access_token";

const storageAvailable = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

export const getStoredToken = () => {
  if (!storageAvailable()) return "";

  try {
    return window.localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

export const storeToken = (token) => {
  if (!storageAvailable() || !token) return;

  try {
    window.localStorage.setItem(TOKEN_KEY, String(token));
  } catch {
    // Authentication can still use the HttpOnly cookie when storage is blocked.
  }
};

export const clearStoredToken = () => {
  if (!storageAvailable()) return;

  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing else is required when storage is unavailable.
  }
};

export const AUTH_TOKEN_STORAGE_KEY = TOKEN_KEY;
