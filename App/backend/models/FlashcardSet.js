const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    difficulty: { type: String, default: "Medium" },
    reviewed: { type: Boolean, default: false },
    correct: { type: Boolean, default: false },
    lastReviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
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
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    sourceType: {
      type: String,
      enum: ["ai", "manual"],
      default: "ai",
    },
    generationMode: {
      type: String,
      enum: ["template", "provider", "manual"],
      default: "template",
    },
    cards: [cardSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("FlashcardSet", flashcardSetSchema);
