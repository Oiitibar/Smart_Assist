const express = require("express");
const protect = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const { aiGenerationGuard } = require("../middleware/aiGenerationGuard");
const controller = require("../controllers/documentAiController");

const router = express.Router();

router.get("/:materialId/view", protect, asyncHandler(controller.viewMaterial));
router.post("/:materialId/study/ask", protect, aiGenerationGuard, asyncHandler(controller.askMaterial));

module.exports = router;
