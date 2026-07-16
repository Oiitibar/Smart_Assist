const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const {
  register,
  login,
  logout,
  me,
} = require("../controllers/authController");

const router = express.Router();
const protect = authMiddleware.protect || authMiddleware;

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/logout", asyncHandler(logout));
router.get("/me", protect, asyncHandler(me));

module.exports = router;
