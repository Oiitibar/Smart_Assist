// Compatibility file.
// Keep this only if some old components import from "./authApi".
// Main auth service is now "./auth".

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getMe,
  updateProfile,
  updatePreferences,
} from "./auth";
