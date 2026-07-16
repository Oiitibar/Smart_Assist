const express = require("express");
const protect = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const { avatarUpload } = require("../middleware/uploadMiddleware");
const controller = require("../controllers/userController");

const router = express.Router();

router.put("/profile", protect, asyncHandler(controller.updateProfile));
router.put("/preferences", protect, asyncHandler(controller.updatePreferences));
router.post("/avatar", protect, avatarUpload.single("avatar"), asyncHandler(controller.uploadAvatar));

module.exports = router;
