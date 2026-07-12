const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    difficulty: { type: String, default: "Medium" },
    reviewed: { type: Boolean, default: false },
    correct: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const flashcardSetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      default: null,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    cards: [cardSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("FlashcardSet", flashcardSetSchema);
