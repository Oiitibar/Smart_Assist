const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 4,
        message: "Each quiz question must have four options",
      },
    },
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: { type: String, default: "", trim: true },
    sourceReference: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

const quizAttemptSchema = new mongoose.Schema(
  {
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        selectedOptionIndex: {
          type: Number,
          required: true,
          min: 0,
          max: 3,
        },
        correct: { type: Boolean, required: true },
      },
    ],
    score: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 1 },
    completedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const quizSetSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    generation: {
      provider: { type: String, default: "" },
      model: { type: String, default: "" },
      questionCount: { type: Number, default: 0 },
      sourceFormat: { type: String, default: "" },
      sourceTextLength: { type: Number, default: 0 },
      sourceTextTruncated: { type: Boolean, default: false },
      generatedAt: { type: Date, default: null },
    },
    questions: [quizQuestionSchema],
    attempts: [quizAttemptSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("QuizSet", quizSetSchema);
