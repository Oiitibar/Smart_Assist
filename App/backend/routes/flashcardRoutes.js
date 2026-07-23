const express = require("express");
const protect = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const controller = require("../controllers/flashcardController");
const { aiGenerationGuard } = require("../middleware/aiGenerationGuard");

const router = express.Router();

router.get("/", protect, asyncHandler(controller.getFlashcardSets));
router.post(
  "/generate",
  protect,
  aiGenerationGuard,
  asyncHandler(controller.generateFlashcards),
);
router.post("/manual", protect, asyncHandler(controller.createManualFlashcard));
router.put("/:setId/review", protect, asyncHandler(controller.updateCardReview));
router.delete(
  "/:setId/cards/:cardId",
  protect,
  asyncHandler(controller.deleteFlashcard),
);
router.delete("/:setId", protect, asyncHandler(controller.deleteFlashcardSet));

module.exports = router;
