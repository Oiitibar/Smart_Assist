const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  register,
  login,
  logout,
  me,
  updateProfile,

  // old naming compatibility
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} = require("../controllers/authController");

const router = express.Router();

// This supports both middleware export styles:
// module.exports = protect;
// module.exports.protect = protect;
const protect = authMiddleware.protect || authMiddleware;

// Auth routes
router.post("/register", register || registerUser);
router.post("/login", login || loginUser);
router.post("/logout", logout || logoutUser);

// Current logged-in user
router.get("/me", protect, me || getMe);

// Optional old project compatibility route
// New frontend should use /api/users/profile,
// but keeping this will not hurt.
router.put("/profile", protect, updateProfile);

module.exports = router;