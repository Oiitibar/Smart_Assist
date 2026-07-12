const express = require("express");
const protect = require("../middleware/authMiddleware");
const { updateProfile, updatePreferences } = require("../controllers/userController");

const router = express.Router();

router.put("/profile", protect, updateProfile);
router.put("/preferences", protect, updatePreferences);

module.exports = router;
