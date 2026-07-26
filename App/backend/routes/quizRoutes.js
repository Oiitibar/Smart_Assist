const express = require("express");
const protect = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const { aiGenerationGuard } = require("../middleware/aiGenerationGuard");
const controller = require("../controllers/quizController");

const router = express.Router();

router.get("/", protect, asyncHandler(controller.getQuizSets));
router.post(
  "/generate",
  protect,
  aiGenerationGuard,
  asyncHandler(controller.generateQuiz),
);
router.post("/:setId/attempts", protect, asyncHandler(controller.submitAttempt));
router.delete("/:setId", protect, asyncHandler(controller.deleteQuizSet));

module.exports = router;
