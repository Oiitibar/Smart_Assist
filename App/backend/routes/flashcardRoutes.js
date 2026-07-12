const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getFlashcardSets,
  generateFlashcards,
  updateCardReview,
  deleteFlashcardSet,
} = require("../controllers/flashcardController");

const router = express.Router();

router.get("/", protect, getFlashcardSets);
router.post("/generate", protect, generateFlashcards);
router.put("/:setId/review", protect, updateCardReview);
router.delete("/:setId", protect, deleteFlashcardSet);

module.exports = router;
